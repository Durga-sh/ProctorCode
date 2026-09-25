package com.codingexam.service;

import com.codingexam.dto.ExamRequest;
import com.codingexam.model.Exam;
import com.codingexam.model.User;
import com.codingexam.repository.ExamRepository;
import com.codingexam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    @Transactional
    public Exam createExam(ExamRequest request, String userEmail) {
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String examCode = generateExamCode();

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .examCode(examCode)
                .createdBy(admin)
                .build();

        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Exam getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
    }

    public Exam getExamByCode(String code) {
        return examRepository.findByExamCode(code)
                .orElseThrow(() -> new RuntimeException("Exam not found with code: " + code));
    }

    public List<Exam> getExamsByAdmin(String userEmail) {
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return examRepository.findByCreatedById(admin.getId());
    }

    @Transactional
    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new RuntimeException("Exam not found with id: " + id);
        }
        examRepository.deleteById(id);
    }

    private String generateExamCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
