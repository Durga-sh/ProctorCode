package com.codingexam.service;

import com.codingexam.dto.ExecutionResponse;
import com.codingexam.model.Result;
import com.codingexam.model.Submission;
import com.codingexam.repository.ResultRepository;
import com.codingexam.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;

    public List<Submission> getSubmissionsByUserAndExam(Long userId, Long examId) {
        return submissionRepository.findByUserIdAndExamId(userId, examId);
    }

    public List<Submission> getSubmissionsByExam(Long examId) {
        return submissionRepository.findByExamId(examId);
    }

    public ExecutionResponse getSubmissionDetails(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<Result> results = resultRepository.findBySubmissionId(submissionId);

        List<ExecutionResponse.TestCaseResult> testCaseResults = results.stream()
                .map(result -> ExecutionResponse.TestCaseResult.builder()
                        .testCaseId(result.getTestCase().getId())
                        .status(result.getStatus().name())
                        .runtimeMs(result.getRuntimeMs())
                        .input(result.getTestCase().getIsHidden() ? "Hidden" : result.getTestCase().getInput())
                        .expectedOutput(result.getTestCase().getIsHidden() ? "Hidden" : result.getTestCase().getExpectedOutput())
                        .actualOutput(result.getTestCase().getIsHidden() ? "Hidden" : result.getActualOutput())
                        .isHidden(result.getTestCase().getIsHidden())
                        .build())
                .collect(Collectors.toList());

        return ExecutionResponse.builder()
                .submissionId(submission.getId())
                .finalStatus(submission.getFinalStatus())
                .score(submission.getScore())
                .testCaseResults(testCaseResults)
                .build();
    }
}
