package com.codingexam.service;

import com.codingexam.dto.QuestionRequest;
import com.codingexam.dto.TestCaseRequest;
import com.codingexam.model.Exam;
import com.codingexam.model.Question;
import com.codingexam.model.TestCase;
import com.codingexam.repository.ExamRepository;
import com.codingexam.repository.QuestionRepository;
import com.codingexam.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final TestCaseRepository testCaseRepository;

    @Transactional
    public Question createQuestion(QuestionRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Question question = Question.builder()
                .exam(exam)
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(Question.Difficulty.valueOf(request.getDifficulty().toUpperCase()))
                .timeLimitMs(request.getTimeLimitMs())
                .memoryLimitMb(request.getMemoryLimitMb())
                .build();

        return questionRepository.save(question);
    }

    public List<Question> getQuestionsByExam(Long examId) {
        return questionRepository.findByExamId(examId);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    // ─── Test Case Operations ───

    @Transactional
    public TestCase addTestCase(TestCaseRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        TestCase testCase = TestCase.builder()
                .question(question)
                .input(request.getInput())
                .expectedOutput(request.getExpectedOutput())
                .isHidden(request.getIsHidden())
                .build();

        return testCaseRepository.save(testCase);
    }

    public List<TestCase> getTestCasesByQuestion(Long questionId) {
        return testCaseRepository.findByQuestionId(questionId);
    }

    public List<TestCase> getSampleTestCases(Long questionId) {
        return testCaseRepository.findByQuestionIdAndIsHidden(questionId, false);
    }

    @Transactional
    public void deleteTestCase(Long id) {
        testCaseRepository.deleteById(id);
    }
}
