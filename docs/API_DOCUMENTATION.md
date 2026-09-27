# API Documentation — AI-Powered Software Testing Assistant

Base URL: `http://localhost:8000/api/v1`

Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a new user account.
- **Request Body**:
  ```json
  {
    "email": "tester@example.com",
    "password": "Password123!",
    "full_name": "Jane Tester",
    "role": "QA Lead"
  }
  ```
- **Response**: `201 Created` with User object.

### `POST /auth/login`
Authenticate user credentials and acquire JWT token.
- **Request Body**:
  ```json
  {
    "email": "tester@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### `GET /auth/me`
Fetch profile of currently authenticated user.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Project Management Endpoints

- `POST /projects`: Create project
- `GET /projects`: List owned projects
- `GET /projects/{id}`: Get project details
- `PUT /projects/{id}`: Update project
- `DELETE /projects/{id}`: Delete project

---

## 3. Requirement & AI Generator Endpoints

- `POST /requirements`: Create requirement
- `GET /requirements`: List requirements (supports `project_id`, `priority`, `status` query params)
- `GET /requirements/{id}`: Get requirement details
- `POST /requirements/{id}/analyze`: Run Phase 7 AI Requirement Analysis
- `POST /requirements/{id}/generate-scenarios`: Run Phase 8 AI Scenario Generation
- `POST /requirements/{id}/generate-test-cases`: Run Phase 9 AI Test Case Generation

---

## 4. Test Case & Execution Endpoints

- `POST /test-cases`: Create test case manually
- `GET /test-cases`: List test cases (supports `project_id`, `requirement_id`, `priority`, `test_type`, `status`, `search`)
- `GET /test-cases/{id}`: Get single test case
- `POST /test-cases/{id}/execute`: Record test case execution run (`Passed`, `Failed`, `Blocked`)
- `GET /test-cases/{id}/executions`: Get execution history

---

## 5. Bug Reporting & AI Diagnostics Endpoints

- `POST /bugs`: Log bug report
- `GET /bugs`: List bug reports
- `POST /bugs/{id}/analyze-ai`: Run Phase 12 AI Bug Root Cause Diagnostics & Severity/Priority suggestion

---

## 6. Dashboard Metrics Endpoint

- `GET /dashboard/stats`: Returns overall pass rates, status counts, severity distributions, and recent activity logs.
