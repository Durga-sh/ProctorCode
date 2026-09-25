package com.codingexam.controller;

import com.codingexam.dto.ExecutionResponse;
import com.codingexam.model.Submission;
import com.codingexam.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @GetMapping("/{userId}/{examId}")
    public ResponseEntity<List<Submission>> getResults(@PathVariable Long userId,
                                                        @PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getSubmissionsByUserAndExam(userId, examId));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<Submission>> getExamResults(@PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getSubmissionsByExam(examId));
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<ExecutionResponse> getSubmissionDetails(@PathVariable Long submissionId) {
        return ResponseEntity.ok(resultService.getSubmissionDetails(submissionId));
    }
}
