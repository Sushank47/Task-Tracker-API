# Task Tracker API - Backend (Server)

RESTful backend service built using Python, FastAPI, PostgreSQL, and SQLAlchemy ORM.

## Tech Stack
- **Python 3.10+**
- **FastAPI**: REST API Framework
- **SQLAlchemy**: Database ORM
- **PostgreSQL**: Relational Database
- **Pydantic**: Data Validation
- **Uvicorn**: ASGI Server

## Project Structure
```text
server/
├── app/
│   ├── main.py        # FastAPI app initialization & middleware
│   ├── models.py      # SQLAlchemy DB models
│   ├── schemas.py     # Pydantic data validation schemas
│   ├── database.py    # Database session setup
│   ├── crud.py        # Database queries & operations
│   ├── routes.py      # API endpoints
│   ├── config.py      # Configuration & environment settings
│   └── utils.py       # Custom exceptions & helpers
├── requirements.txt   # Python dependencies
├── .env.example       # Environment variables template
└── README.md
```

## Setup & Running Locally

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the ASGI server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Interactive API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
