# HAYA — AI-Powered University Management System

HAYA is an intelligent university management platform that combines a relational database backend with a Retrieval-Augmented Generation (RAG) AI assistant. Designed for the French University in Armenia (UFAR), it centralizes student data, course management, and academic workflows under one system — while providing students and instructors with an AI tutor that guides learning through the Socratic method rather than giving direct answers.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Repository Structure](#repository-structure)
4. [Architecture](#architecture)
5. [AI Assistant — Technical Deep Dive](#ai-assistant--technical-deep-dive)
6. [Database Design](#database-design)
7. [API Reference](#api-reference)
8. [Frontend](#frontend)
9. [Setup and Installation](#setup-and-installation)
10. [Running the Project](#running-the-project)
11. [Ingesting Course Materials](#ingesting-course-materials)
12. [Testing](#testing)
13. [Known Limitations and Future Work](#known-limitations-and-future-work)

---

## Project Overview

Higher education faces a persistent challenge: students increasingly rely on surface-level memorization rather than developing deep analytical understanding. Generic AI tools accelerate this problem by providing direct answers rather than fostering critical thinking.

HAYA addresses this by combining two systems:

- **A structured university management database** — handling students, courses, groups, instructors, enrollments, grades, and assignments with full relational integrity.
- **A RAG-powered AI tutor** — that retrieves context from university course materials and guides students toward answers using the Socratic method, never giving solutions outright.

The system supports two user roles: **students**, who access course materials, grades, and the AI assistant, and **instructors**, who manage courses, upload materials, and enter grades.

---

## Features

### AI Assistant
- Retrieval-Augmented Generation (RAG) pipeline grounded in actual university course materials
- Socratic tutoring behavior — asks guiding questions instead of giving direct answers
- Multilingual support — detects and matches the language of each user message (Armenian, English, French)
- Session-based conversation memory — retains the last 10 exchanges per session
- Source citation — every response includes the course material sources used
- Confidence scoring — each answer is accompanied by a retrieval confidence score
- In-PDF chat panel — AI assistant accessible directly inside the PDF document viewer

### Platform Management
- Role-based access — separate student and instructor dashboards
- Course management with expandable accordion views and inline PDF viewer
- Instructor grade entry per course with per-student input
- Course materials upload and management panel
- Student profile page with GPA, enrollment year, and contact details

### Database
- 11 fully normalized relational tables
- Views for student grades, current group, graduation summary, and instructor assignments
- Stored procedures for transcript retrieval, grade recording, and group history
- Triggers for automatic audit logging
- Indexes for query performance optimization
- DCL access control with admin and read-only user roles
- Backup and restore scripts

---

## Repository Structure

```text
Haya_AI/
├── backend/
│   ├── __init__.py
│   └── main.py                  # FastAPI application, chat and session endpoints
│
├── module/
│   ├── __init__.py
│   ├── rag_engine.py            # RAG pipeline: embeddings, FAISS retrieval, Groq inference
│   ├── document_processor.py   # PDF text extraction and text chunking
│   └── utils.py                 # Text cleaning, token estimation, context truncation
│
├── frontend/
│   ├── index.html               # Single-page application (all views)
│   ├── script.js                # All UI logic, routing, API calls, PDF viewer
│   ├── style.css                # Application styles
│   ├── IMG/                     # Logo and profile images
│   └── pdf/                     # Sample PDF documents
│
├── Database/
│   ├── Q01_Create_Database.sql
│   ├── Q02_Create_Tables.sql    # 11 tables with PK, FK, UNIQUE, CHECK constraints
│   ├── Q03_Insert_Data.sql
│   ├── Q04_DQL_Queries.sql      # Analytical SELECT queries
│   ├── Q05_Create_Views.sql     # 4 views
│   ├── Q06_Create_Indexes.sql
│   ├── Q07_Create_Triggers.sql
│   ├── Q08_Create_Stored_Procedures.sql  # 3 stored procedures
│   ├── Q09_DCL_Access_Control.sql
│   └── Q10_Deploy_Backup_Database.sql
│
├── data/
│   ├── uploaded/                # Source PDF course materials
│   ├── processed/               # Extracted and chunked text (JSON)
│   └── vector_store/
│       ├── faiss.index          # FAISS binary index (~652 document chunks)
│       └── documents.json       # Chunk metadata and text
│
├── ingest.py                    # One-time PDF ingestion script
├── quick_test.py                # Terminal-based chat test
├── requirements.txt
└── .gitignore
```

---

## Architecture

```
User (Browser)
     │
     │  HTTP / fetch()
     ▼
frontend/index.html + script.js
     │
     │  POST http://localhost:8000/chat
     │  { message, session_id }
     ▼
backend/main.py  (FastAPI)
     │
     ├── conversation_histories[session_id]   # In-memory session store
     │
     └── RAGEngine.query(question, history)
              │
              ├── 1. Embed query
              │      SentenceTransformer
              │      paraphrase-multilingual-MiniLM-L12-v2
              │
              ├── 2. Retrieve top-3 chunks
              │      FAISS IndexFlatL2
              │      L2 distance → similarity score
              │
              ├── 3. Build prompt
              │      System prompt (Socratic tutor role)
              │      + Last 4 conversation turns
              │      + Retrieved context (truncated to 2000 tokens)
              │      + Student question
              │
              └── 4. Generate answer
                     Groq API
                     llama-3.3-70b-versatile
                     temperature=0.7, max_tokens=1024
```

---

## AI Assistant — Technical Deep Dive

### RAG Pipeline

Retrieval-Augmented Generation grounds the language model's responses in actual course documents rather than relying on its training data alone. This prevents hallucinations and ensures answers are specific to the university's curriculum.

**Ingestion phase** (run once via `ingest.py`):

1. PDFs are loaded from `data/uploaded/`
2. `DocumentProcessor` uses **PyMuPDF (fitz)** to extract text page by page, up to 50 pages per document
3. Text is split into overlapping chunks using LangChain's `RecursiveCharacterTextSplitter`:
   - chunk size: 800 characters
   - overlap: 150 characters
   - separators: paragraph breaks → line breaks → sentence endings → words
4. Each chunk is embedded using `paraphrase-multilingual-MiniLM-L12-v2` (384-dimensional vectors), chosen for its multilingual capability covering Armenian, English, and French
5. Embeddings are added to a **FAISS `IndexFlatL2`** index and persisted to disk alongside chunk metadata

**Query phase** (every chat message):

1. The user's question is embedded with the same model
2. FAISS performs an exact L2 nearest-neighbor search, returning the top 3 most semantically similar chunks
3. Similarity scores are computed as `1 / (1 + L2_distance)`, normalized to `[0, 1]`
4. Retrieved chunks are assembled into a context string with source labels
5. Context is truncated to 2000 tokens using a character-based estimator (`1 token ≈ 4 chars`) to stay within model limits
6. The full prompt — system role, conversation history (last 4 turns), context, and question — is sent to the **Groq API** running `llama-3.3-70b-versatile`
7. The response, source filenames, and average confidence score are returned to the frontend

### Socratic System Prompt

The AI's behavior is controlled entirely by its system prompt. The key behavioral constraints are:

- Never give direct answers to academic questions
- Ask one guiding question at a time
- After two failed hints, give a small nudge — not the solution
- Act as a platform navigator for non-academic questions
- Match the language of the student's last message silently, without narrating the switch

### Embedding Model

| Property | Value |
|---|---|
| Model | `paraphrase-multilingual-MiniLM-L12-v2` |
| Dimensions | 384 |
| Languages | 50+ including Armenian, English, French |
| Index type | FAISS `IndexFlatL2` (exact search) |
| Chunks indexed | ~652 |

### Language Model

| Property | Value |
|---|---|
| Provider | Groq API |
| Model | `llama-3.3-70b-versatile` |
| Temperature | 0.7 |
| Max tokens | 1024 |
| Context window used | Last 4 conversation turns + retrieved context |

---

## Database Design

The database is implemented in **Microsoft SQL Server** and consists of 11 normalized tables.

### Entity Relationship Overview

```
Faculty ──< Group >── StudyYear
               │
               └──< StudentGroupHistory >── Student
                                                │
                                           Enrollment
                                                │
                                          CourseGroup >── Course
                                                │              │
                                            Assignment    Instructor
                                                │
                                           Submission
                                                │
                                             Grade
```

### Tables

| Table | Primary Key | Description |
|---|---|---|
| `Student` | `StudentID` | Student identity and contact |
| `Faculty` | `FacultyID` | Academic faculty |
| `StudyYear` | `StudyYearID` | Year 1–4 with CHECK constraint |
| `Group` | `GroupID` | Academic group linked to faculty and year |
| `Course` | `CourseID` | Course name and credits (1–10) |
| `Instructor` | `InstructorID` | Instructor identity |
| `CourseGroup` | `CourseGroupID` | Course offering per semester/year |
| `Enrollment` | `EnrollmentID` | Student–CourseGroup membership |
| `Assignment` | `AssignmentID` | Assignments per CourseGroup |
| `Submission` | `SubmissionID` | Student assignment submissions |
| `Grade` | `GradeID` | Grade per enrollment with comments |

### Views

| View | Description |
|---|---|
| `vw_StudentGrades` | Student name, course, grade, and comments joined across 4 tables |
| `vw_CurrentStudentGroup` | Most recent group per student using academic year ordering |
| `vw_GraduationSummary` | Aggregated credit and grade summary per student |
| `vw_InstructorAssignments` | All assignments per instructor across their courses |

### Stored Procedures

| Procedure | Parameters | Description |
|---|---|---|
| `sp_GetStudentTranscript` | `@StudentID INT` | Full academic transcript with course, semester, grade |
| `sp_RecordGrade` | `@EnrollmentID, @GradeValue, @Comments` | Insert or update a grade record |
| `sp_AddStudentGroupHistory` | `@StudentID, @GroupID, @Year` | Record a student's group assignment |

### Access Control

Two SQL Server users are provisioned:

| User | Role | Permissions |
|---|---|---|
| `UniAdminUser` | Administrator | Full control on `UniversityDB` |
| `UniReadUser` | Read-only | `SELECT` only — used by backend queries |

---

## API Reference

The backend exposes a REST API via FastAPI running on `http://localhost:8000`.

### `GET /`
Health check.

**Response:**
```json
{ "status": "Haya backend is running" }
```

---

### `POST /chat`
Send a message to the AI assistant and receive a Socratic response grounded in course materials.

**Request body:**
```json
{
  "message": "What is Bayes theorem?",
  "session_id": "session_abc123"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | yes | The student's question or message |
| `session_id` | string | no | Unique session identifier for conversation memory. Defaults to `"default"` |

**Response:**
```json
{
  "response": "Before I explain, what do you think the term 'prior probability' might mean?",
  "sources": ["Probability Theory book by Khosrovyan", "Probability theory CS 2025"],
  "confidence": 0.73
}
```

| Field | Type | Description |
|---|---|---|
| `response` | string | Haya's Socratic reply |
| `sources` | array of strings | Course material filenames used as context |
| `confidence` | float | Average retrieval similarity score (0–1) |

---

### `DELETE /chat/{session_id}`
Clear conversation history for a session.

**Response:**
```json
{ "status": "cleared" }
```

---

## Frontend

The frontend is a vanilla JavaScript single-page application. All views are rendered in `index.html` and toggled via `display` properties controlled by `script.js`. No framework is used.

### Views and Routing

| View | Trigger | Description |
|---|---|---|
| Landing page | Default | Platform description and login entry point |
| Login | Click "Log In" | Credential validation, routes to student or professor dashboard |
| Student profile | Post-login | Avatar, GPA, enrollment year, contact info |
| AI Assistant | Navbar link | Full-page chat interface connected to backend |
| Courses | Navbar link | Accordion course list with inline PDF viewer |
| PDF viewer | Click document | Opens in new window with embedded AI chat panel, zoom, page navigation, and text selection to chat |
| Professor dashboard | Professor login | Profile and department info |
| Professor courses | Navbar link | Course accordion with content management |
| Students list | Navbar link | Enrolled student roster |
| Enter grades | Navbar link | Per-course grade entry table |
| Course materials | Navbar link | Upload and manage course documents |

### PDF Viewer

The PDF viewer is built with **PDF.js** (v3.11.174) and renders all pages as canvas elements with a selectable text layer. Features include:

- Zoom in/out with live re-render
- Page number input for direct navigation
- Text selection automatically populates the AI chat input
- Side panel AI chat powered by the same backend endpoint
- Download button for the source PDF

### Demo Credentials

| Role | Username | Password |
|---|---|---|
| Student | `student` | `1234` |
| Professor | `professor` | `1234` |

> Authentication is mock-only in this phase. Database-backed authentication is planned for the next semester.

---

## Setup and Installation

### Prerequisites

- Python 3.10+
- pip
- A virtual environment tool (`venv`)
- A Groq API key — free tier at [console.groq.com](https://console.groq.com)
- Microsoft SQL Server (for database component)

### 1. Clone the repository

```bash
git clone https://github.com/MeriZakaryan/Haya_AI.git
cd Haya_AI
```

### 2. Create and activate virtual environment

```bash
python -m venv haya
source haya/bin/activate        # Linux/macOS
haya\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
pip install groq pymupdf
```

### 4. Configure environment variables

```bash
echo "GROQ_API_KEY=your_key_here" > .env
```

> Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Running the Project

### Start the backend

```bash
source haya/bin/activate
uvicorn backend.main:app --reload --port 8000
```

Expected output:
```
Loading embedding model...
Loading existing vector store...
Loaded 652 documents
INFO: Application startup complete.
INFO: Uvicorn running on http://127.0.0.1:8000
```

### Open the frontend

Open `frontend/index.html` in a browser using a live server (e.g. VS Code Live Server extension) or any static file server:

```bash
cd frontend
python -m http.server 5500
```

Then navigate to `http://localhost:5500`.

---

## Ingesting Course Materials

The vector store is pre-built and included in the repository. If you want to add new PDFs or rebuild the index from scratch:

```bash
# Place PDF files in data/uploaded/
# Then run:
source haya/bin/activate
python ingest.py
```

The script:
1. Loads the RAG engine once (avoiding repeated model loading)
2. Iterates over all PDFs in `data/uploaded/`
3. Extracts text using PyMuPDF
4. Chunks and embeds each document
5. Saves the updated FAISS index to `data/vector_store/`

To reset the vector store and start fresh:

```python
from module.rag_engine import RAGEngine
rag = RAGEngine()
rag.reset_vector_store()
```

---

## Testing

### Terminal chat test

A quick interactive test that bypasses the HTTP layer entirely:

```bash
source haya/bin/activate
python quick_test.py
```

```
Haya is ready. Type your question (or 'quit' to exit)

You: What is a random variable?
Haya: Before we define it formally, can you think of an experiment whose outcome you cannot predict with certainty?
Sources: ['Probability Theory book by Khosrovyan', 'Probability theory CS 2025']
Confidence: 0.71
```

### API test via curl

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Bayes theorem?", "session_id": "test"}'
```

### Module import test

```bash
python -c "
from module.rag_engine import RAGEngine
from module.document_processor import DocumentProcessor
from module.utils import clean_text
r = RAGEngine()
print('All modules loaded:', len(r.documents), 'chunks in vector store')
"
```

---

## Known Limitations and Future Work

### Current limitations

| Area | Limitation |
|---|---|
| Authentication | Hardcoded credentials — no database-backed login |
| Chat history | In-memory only — cleared on server restart |
| Course materials | Statically ingested — not dynamically linked per student enrollment |
| OCR | Scanned Armenian PDFs fail extraction — PyMuPDF handles text-layer PDFs only |
| Database | SQL scripts exist but are not yet connected to the backend API |

### Planned for next semester (S4)

- Full database integration — connect FastAPI endpoints to SQL Server via `pyodbc`
- Session-persistent chat history stored in the database per student
- Dynamic material loading based on enrolled courses
- Database-backed authentication replacing mock credentials
- Instructor material upload pipeline wired to the RAG ingestion system
- Expanded course coverage beyond Probability Theory
- Improved Armenian OCR using Tesseract with `hye` language pack

---

## Authors

| Name | Role |
|---|---|
| Meri Zakaryan | AI assistant, RAG pipeline, backend |
| Karapet Hovhannisyan | Frontend development, UI/UX |
| Emilya Karapetyan | Database design and implementation |

**Institution:** French University in Armenia (UFAR)  
**Faculty:** Computer Science and Applied Mathematics  
**Academic year:** 2025–2026, Semester 3

---

## License

This project was developed as an academic project at UFAR. All rights reserved by the authors.