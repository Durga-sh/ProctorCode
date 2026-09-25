-- ═══════════════════════════════════════════════════════════
-- CODING EXAM PLATFORM — MySQL Schema
-- ═══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS coding_exam_db;
USE coding_exam_db;

-- ───────────────────────────────────────────────────────────
-- USERS TABLE
-- ───────────────────────────────────────────────────────────
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- EXAMS TABLE
-- ───────────────────────────────────────────────────────────
CREATE TABLE exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    exam_code VARCHAR(20) NOT NULL UNIQUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- QUESTIONS TABLE
-- ───────────────────────────────────────────────────────────
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'EASY',
    time_limit_ms INT NOT NULL DEFAULT 5000,
    memory_limit_mb INT NOT NULL DEFAULT 256,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- TEST CASES TABLE
-- ───────────────────────────────────────────────────────────
CREATE TABLE test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    input TEXT,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- SUBMISSIONS TABLE
-- ───────────────────────────────────────────────────────────
CREATE TABLE submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    language VARCHAR(20) NOT NULL,
    code TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    final_status VARCHAR(50),
    score DOUBLE DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- RESULTS TABLE
-- ───────────────────────────────────────────────────────────
CREATE TABLE results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    test_case_id BIGINT NOT NULL,
    status ENUM('PASS', 'FAIL', 'TLE', 'CE', 'MLE', 'RE') NOT NULL,
    runtime_ms DOUBLE,
    actual_output TEXT,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────────────────
CREATE INDEX idx_exams_code ON exams(exam_code);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_test_cases_question ON test_cases(question_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_question ON submissions(question_id);
CREATE INDEX idx_results_submission ON results(submission_id);

-- ───────────────────────────────────────────────────────────
-- SEED: Default Admin User (password: admin123)
-- BCrypt hash for 'admin123'
-- ───────────────────────────────────────────────────────────
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@codingexam.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');
