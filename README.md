# CodeExam — Coding Exam Platform

Full-stack coding exam platform with React frontend, Spring Boot backend, and MySQL database.

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Judge0 API (self-hosted at localhost:2358)

### 1. Database Setup
```sql
mysql -u root -p < database/schema.sql
```

### 2. Backend (Spring Boot)
```bash
cd backend
# Update database credentials in src/main/resources/application.properties
./mvnw spring-boot:run
```
Backend runs on http://localhost:8080

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Default Admin Login
- **Email:** admin@codingexam.com
- **Password:** admin123

## Project Structure
```
Exam/
├── database/
│   └── schema.sql                 # MySQL schema + seed data
├── backend/                       # Spring Boot 3.2.5
│   ├── pom.xml
│   └── src/main/java/com/codingexam/
│       ├── CodingExamApplication.java
│       ├── config/                # AppConfig, WebSocketConfig
│       ├── controller/            # REST controllers
│       ├── dto/                   # Request/Response DTOs
│       ├── exception/             # Global error handler
│       ├── model/                 # JPA entities
│       ├── repository/            # Spring Data repositories
│       ├── security/              # JWT + Spring Security
│       └── service/               # Business logic + Judge0
└── frontend/                      # React + Vite
    └── src/
        ├── api/axios.js           # Axios with JWT interceptor
        ├── context/AuthContext.jsx # Global auth state
        ├── components/            # Reusable components
        └── pages/                 # Route pages
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login → JWT |
| POST | /api/exams | ADMIN | Create exam |
| GET | /api/exams | Auth | List exams |
| GET | /api/exams/{id} | Auth | Get exam |
| DELETE | /api/exams/{id} | ADMIN | Delete exam |
| POST | /api/questions | ADMIN | Add question |
| GET | /api/questions/{examId} | Auth | Get questions |
| POST | /api/testcases | ADMIN | Add test case |
| POST | /api/submissions/run | STUDENT | Run code |
| POST | /api/submissions/submit | STUDENT | Submit code |
| GET | /api/results/{userId}/{examId} | Auth | Get results |
