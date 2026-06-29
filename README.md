# 🚀 Task Tracker API & Full-Stack Application

A modern, high-performance task management application built with a **FastAPI** backend, **MongoDB Atlas** database, **JWT & Google OAuth** authentication, and a sleek **Vite React** interactive frontend.

---

## ✨ Key Features

### ⚡ Backend Services (`server/`)
- **FastAPI Framework**: High performance asynchronous RESTful API.
- **MongoDB Atlas Document Database**: Persistent cloud document storage using `motor` async drivers.
- **Authentication**: JWT Bearer Tokens & Google Identity OAuth 2.0.
- **Task & Subtask Management**: Full CRUD support with atomic sequence counters for clean IDs.
- **Categorization & Activity Auditing**: Dynamic color-coded tags and historical task activity logs.
- **Bulk Operations**: Multi-task status updates and bulk deletion endpoints.
- **Interactive Documentation**: Swagger UI & ReDoc auto-generated documentation.

### 🎨 Frontend Workspace (`client/`)
- **Modern UI Design System**: Glassmorphism aesthetic with vibrant gradients, glowing accents, and dark mode styling.
- **Protected Workspace Gateway**: Public landing page guide with secured user dashboard.
- **Interactive Checklist**: Real-time subtask checklist with visual progress bars.
- **Security Control**: Password visibility toggles and Google OAuth instant sign-in.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend Framework** | Python 3.12, FastAPI, Uvicorn |
| **Database** | MongoDB Atlas, Motor (Async MongoDB), PyMongo |
| **Security** | JWT (`python-jose`), Native `bcrypt` encryption |
| **Frontend Framework** | React 18, Vite |
| **Styling** | Vanilla CSS Tokens, Flexbox/Grid layouts |

---

## ⚙️ Project Structure

```text
Task Tracker API/
├── client/                 # Vite + React Frontend Application
│   ├── src/                # Components, Styles & API Services
│   ├── index.html          # Gateway Entrypoint & Google SDK
│   └── package.json        # Node dependencies
├── server/                 # FastAPI Backend Service
│   ├── app/                # Routers, Mongo CRUD, Models & Config
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── .gitignore              # Git exclusion rules
└── README.md               # Root Project Documentation
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+) & pip
- MongoDB Atlas cluster or local MongoDB service

---

### 2️⃣ Backend Setup (`server/`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure your environment variables (`.env`):
   ```env
   PROJECT_NAME="Task Tracker API"
   API_V1_STR=/api/v1
   MONGODB_URL="your_mongodb_atlas_connection_string"
   MONGODB_DB_NAME=Task_Tracker_API
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

### 3️⃣ Frontend Setup (`client/`)

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```

2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

3. Open your browser at **`http://localhost:5174`** (or `http://localhost:5173`).

---

## 🔑 Default Administrator Credentials

- **Email**: `admin@tasktracker.com`
- **Password**: `admin123`

---

## 📖 API Documentation

Once the backend is running, access interactive documentation directly:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
