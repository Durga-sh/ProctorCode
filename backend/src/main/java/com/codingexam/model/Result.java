package com.codingexam.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnoreProperties({"results", "hibernateLazyInitializer", "handler"})
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false)
    @JsonIgnoreProperties({"question", "hibernateLazyInitializer", "handler"})
    private TestCase testCase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "runtime_ms")
    private Double runtimeMs;

    @Column(name = "actual_output", columnDefinition = "TEXT")
    private String actualOutput;

    public enum Status {
        PASS, FAIL, TLE, CE, MLE, RE
    }
}
