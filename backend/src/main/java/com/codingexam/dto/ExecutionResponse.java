package com.codingexam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResponse {
    private Long submissionId;
    private String finalStatus;
    private Double score;
    private List<TestCaseResult> testCaseResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private Long testCaseId;
        private String status;
        private Double runtimeMs;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private Boolean isHidden;
    }
}
