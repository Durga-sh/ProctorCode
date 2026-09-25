package com.codingexam.controller;

import com.codingexam.dto.QuestionRequest;
import com.codingexam.dto.TestCaseRequest;
import com.codingexam.model.Question;
import com.codingexam.model.TestCase;
import com.codingexam.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // ─── Question Endpoints ───

    @PostMapping("/questions")
    public ResponseEntity<Question> createQuestion(@Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(request));
    }

    @GetMapping("/questions/{examId}")
    public ResponseEntity<List<Question>> getQuestionsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(questionService.getQuestionsByExam(examId));
    }

    @GetMapping("/questions/detail/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Test Case Endpoints ───

    @PostMapping("/testcases")
    public ResponseEntity<TestCase> addTestCase(@Valid @RequestBody TestCaseRequest request) {
        return ResponseEntity.ok(questionService.addTestCase(request));
    }

    @GetMapping("/testcases/{questionId}")
    public ResponseEntity<List<TestCase>> getTestCases(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getTestCasesByQuestion(questionId));
    }

    @GetMapping("/testcases/sample/{questionId}")
    public ResponseEntity<List<TestCase>> getSampleTestCases(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getSampleTestCases(questionId));
    }

    @DeleteMapping("/testcases/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        questionService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }
}
