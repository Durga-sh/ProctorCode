package com.codingexam.service;

import com.codingexam.dto.CodeExecutionRequest;
import com.codingexam.dto.ExecutionResponse;
import com.codingexam.model.*;
import com.codingexam.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionService {

    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    @Value("${judge0.api.url}")
    private String judge0Url;

    private final WebClient.Builder webClientBuilder;

    // Language ID mapping
    private static final Map<String, Integer> LANGUAGE_MAP = Map.of(
            "python", 71,
            "java", 62,
            "cpp", 54
    );

    @Transactional
    public ExecutionResponse executeCode(CodeExecutionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Get test cases based on run/submit type
        List<TestCase> testCases;
        if ("run".equalsIgnoreCase(request.getType())) {
            testCases = testCaseRepository.findByQuestionIdAndIsHidden(question.getId(), false);
        } else {
            testCases = testCaseRepository.findByQuestionId(question.getId());
        }

        if (testCases.isEmpty()) {
            throw new RuntimeException("No test cases found for this question");
        }

        // Create submission record
        Submission submission = Submission.builder()
                .user(user)
                .question(question)
                .language(request.getLanguage())
                .code(request.getCode())
                .build();
        submission = submissionRepository.save(submission);

        // Execute against each test case
        List<ExecutionResponse.TestCaseResult> testCaseResults = new ArrayList<>();
        int passedCount = 0;

        Integer languageId = LANGUAGE_MAP.get(request.getLanguage().toLowerCase());
        if (languageId == null) {
            throw new RuntimeException("Unsupported language: " + request.getLanguage());
        }

        WebClient webClient = webClientBuilder.baseUrl(judge0Url).build();

        for (TestCase testCase : testCases) {
            try {
                // Call Judge0 API
                Map<String, Object> judge0Request = new HashMap<>();
                judge0Request.put("source_code", request.getCode());
                judge0Request.put("language_id", languageId);
                judge0Request.put("stdin", testCase.getInput() != null ? testCase.getInput() : "");
                judge0Request.put("expected_output", testCase.getExpectedOutput());
                judge0Request.put("cpu_time_limit", question.getTimeLimitMs() / 1000.0);
                judge0Request.put("memory_limit", question.getMemoryLimitMb() * 1000);

                @SuppressWarnings("unchecked")
                Map<String, Object> judge0Response = webClient.post()
                        .uri("/submissions?base64_encoded=false&wait=true")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .bodyValue(judge0Request)
                        .retrieve()
                        .onStatus(status -> status.isError(), clientResponse ->
                                clientResponse.bodyToMono(String.class)
                                        .map(body -> new RuntimeException("Judge0 HTTP " + clientResponse.statusCode() + ": " + body))
                        )
                        .bodyToMono(Map.class)
                        .block();

                // Parse Judge0 response
                Result.Status status = parseJudge0Status(judge0Response);
                String actualOutput = judge0Response != null ?
                        (String) judge0Response.get("stdout") : null;
                Double runtime = judge0Response != null && judge0Response.get("time") != null ?
                        Double.parseDouble(judge0Response.get("time").toString()) * 1000 : null;

                if (actualOutput == null && judge0Response != null) {
                    actualOutput = (String) judge0Response.get("compile_output");
                    if (actualOutput == null) {
                        actualOutput = (String) judge0Response.get("stderr");
                    }
                }

                // Save result
                Result result = Result.builder()
                        .submission(submission)
                        .testCase(testCase)
                        .status(status)
                        .runtimeMs(runtime)
                        .actualOutput(actualOutput)
                        .build();
                resultRepository.save(result);

                if (status == Result.Status.PASS) {
                    passedCount++;
                }

                // Build response DTO
                ExecutionResponse.TestCaseResult tcResult = ExecutionResponse.TestCaseResult.builder()
                        .testCaseId(testCase.getId())
                        .status(status.name())
                        .runtimeMs(runtime)
                        .input(testCase.getIsHidden() ? "Hidden" : testCase.getInput())
                        .expectedOutput(testCase.getIsHidden() ? "Hidden" : testCase.getExpectedOutput())
                        .actualOutput(testCase.getIsHidden() ? "Hidden" : actualOutput)
                        .isHidden(testCase.getIsHidden())
                        .build();
                testCaseResults.add(tcResult);

            } catch (Exception e) {
                log.error("Judge0 execution error for test case {}: {}", testCase.getId(), e.getMessage());

                Result result = Result.builder()
                        .submission(submission)
                        .testCase(testCase)
                        .status(Result.Status.RE)
                        .actualOutput("Execution error: " + e.getMessage())
                        .build();
                resultRepository.save(result);

                testCaseResults.add(ExecutionResponse.TestCaseResult.builder()
                        .testCaseId(testCase.getId())
                        .status("RE")
                        .actualOutput("Execution error: " + e.getMessage())
                        .isHidden(testCase.getIsHidden())
                        .build());
            }
        }

        // Calculate score
        double score = ((double) passedCount / testCases.size()) * 100;
        String finalStatus = passedCount == testCases.size() ? "ACCEPTED" : "PARTIAL";

        submission.setScore(score);
        submission.setFinalStatus(finalStatus);
        submissionRepository.save(submission);

        return ExecutionResponse.builder()
                .submissionId(submission.getId())
                .finalStatus(finalStatus)
                .score(score)
                .testCaseResults(testCaseResults)
                .build();
    }

    @SuppressWarnings("unchecked")
    private Result.Status parseJudge0Status(Map<String, Object> response) {
        if (response == null) return Result.Status.RE;

        Map<String, Object> statusObj = (Map<String, Object>) response.get("status");
        if (statusObj == null) return Result.Status.RE;

        int statusId = ((Number) statusObj.get("id")).intValue();

        return switch (statusId) {
            case 3 -> Result.Status.PASS;       // Accepted
            case 4 -> Result.Status.FAIL;       // Wrong Answer
            case 5 -> Result.Status.TLE;        // Time Limit Exceeded
            case 6 -> Result.Status.CE;         // Compilation Error
            case 7, 8, 9, 10, 11, 12 -> Result.Status.RE;  // Runtime errors
            case 13 -> Result.Status.RE;        // Internal Error
            case 14 -> Result.Status.RE;        // Exec Format Error
            default -> Result.Status.FAIL;
        };
    }
}
