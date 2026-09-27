# Backend — AI-Powered Software Testing Assistant

FastAPI backend providing REST APIs, authentication, multi-tenant authorization, SQLAlchemy ORM database models, and pluggable LLM AI service architecture.

## How to Run

1. Ensure python dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application with Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. Run the automated test suite:
   ```bash
   python -m pytest -v
   ```

Interactive API documentation available at `http://127.0.0.1:8000/docs`.
