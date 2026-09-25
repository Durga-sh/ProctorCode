package com.codingexam.repository;

import com.codingexam.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserId(Long userId);
    List<Submission> findByQuestionId(Long questionId);

    @Query("SELECT s FROM Submission s WHERE s.user.id = :userId AND s.question.exam.id = :examId")
    List<Submission> findByUserIdAndExamId(@Param("userId") Long userId, @Param("examId") Long examId);

    @Query("SELECT s FROM Submission s WHERE s.question.exam.id = :examId")
    List<Submission> findByExamId(@Param("examId") Long examId);

    @Query("SELECT s FROM Submission s WHERE s.user.id = :userId AND s.question.id = :questionId ORDER BY s.submittedAt DESC")
    List<Submission> findByUserIdAndQuestionIdOrderBySubmittedAtDesc(@Param("userId") Long userId, @Param("questionId") Long questionId);
}
