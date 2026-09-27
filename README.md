# AI-POWERED SOFTWARE TESTING ASSISTANT

A realistic production-grade full-stack web application designed for software QA engineers and testers. Convert user requirements into structured test scenarios and test cases, execute test runs, log defect reports, and leverage AI for requirement analysis and root cause bug diagnostics.

---

## Architecture & Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT authentication, Passlib (Bcrypt) password hashing, SQLite/PostgreSQL.
- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, Vanilla CSS design system (Dark Mode & Glassmorphism).
- **AI Subsystem**: Pluggable `AIService` facade layer with support for OpenAI, Gemini, Ollama, Groq, and zero-cost `MockAIProvider` fallback, complete with robust JSON extraction and repair parser.
- **Testing**: `pytest` test suite with 100% pass rate across auth, authorization, CRUD, AI parser, execution, and bug workflows.

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed

### 2. Run the Backend

```bash
# Navigate to backend directory
cd backend

# Install python dependencies
python -m pip install -r requirements.txt

# Run FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://localhost:8000/docs`
- API Health Check: `http://localhost:8000/health`

### 3. Run Backend Automated Tests

```bash
cd backend
python -m pytest -v
```

### 4. Run the React Frontend

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
- Web Application UI: `http://localhost:5173`

---

## Project Workflow

```
Requirement
    ↓
Requirement Analysis (AI)
    ↓
Test Scenarios Generation (Positive, Negative, Edge, Boundary, Security)
    ↓
Test Cases Generation (TC-ID, Objective, Preconditions, Steps, Expected Results)
    ↓
Test Execution (Passed, Failed, Blocked)
    ↓
Bug Reporting (Auto-create on execution failure or manual log)
    ↓
AI Bug Diagnostics (Root cause analysis, Suggested Severity & Priority, Fix steps)
    ↓
Quality Dashboard (Pass rates, Status distributions, Activity logs)
```

---

## Environment Variables Configuration

Copy `.env.example` to `.env` inside `backend/`:
```env
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=change_this_to_a_secure_random_32_character_string
AI_PROVIDER=mock
AI_API_KEY=your_optional_llm_api_key
AI_MODEL_NAME=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1
```

---

## Docker Support

Spin up PostgreSQL database and backend using Docker Compose:
```bash
docker-compose up --build
```
