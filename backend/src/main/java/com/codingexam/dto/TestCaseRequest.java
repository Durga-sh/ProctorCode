package com.codingexam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TestCaseRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private String input;

    @NotBlank(message = "Expected output is required")
    private String expectedOutput;

    private Boolean isHidden = false;
}
