package com.codingexam.controller;

import com.codingexam.dto.CodeExecutionRequest;
import com.codingexam.dto.ExecutionResponse;
import com.codingexam.service.ExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final ExecutionService executionService;

    @PostMapping("/run")
    public ResponseEntity<ExecutionResponse> runCode(@Valid @RequestBody CodeExecutionRequest request,
                                                      Authentication authentication) {
        request.setType("run");
        return ResponseEntity.ok(executionService.executeCode(request, authentication.getName()));
    }

    @PostMapping("/submit")
    public ResponseEntity<ExecutionResponse> submitCode(@Valid @RequestBody CodeExecutionRequest request,
                                                         Authentication authentication) {
        request.setType("submit");
        return ResponseEntity.ok(executionService.executeCode(request, authentication.getName()));
    }
}
