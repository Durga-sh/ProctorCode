package com.codingexam.controller;

import com.codingexam.dto.ExamRequest;
import com.codingexam.model.Exam;
import com.codingexam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    public ResponseEntity<Exam> createExam(@Valid @RequestBody ExamRequest request,
                                            Authentication authentication) {
        return ResponseEntity.ok(examService.createExam(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Exam> getExamByCode(@PathVariable String code) {
        return ResponseEntity.ok(examService.getExamByCode(code));
    }

    @GetMapping("/my-exams")
    public ResponseEntity<List<Exam>> getMyExams(Authentication authentication) {
        return ResponseEntity.ok(examService.getExamsByAdmin(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}
