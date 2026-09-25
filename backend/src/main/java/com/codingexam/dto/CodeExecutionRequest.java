package com.codingexam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CodeExecutionRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Language is required")
    private String language; // "python", "java", "cpp"

    @NotBlank(message = "Type is required")
    private String type; // "run" or "submit"
}
