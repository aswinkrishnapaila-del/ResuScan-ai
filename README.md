# 🚀 ResuScan AI

ResuScan AI is an intelligent, full-stack application designed to help job seekers build, optimize, and scan their resumes against Job Descriptions (JD). Powered by the Groq AI API, it provides real-time feedback, ATS optimization suggestions, and a beautiful live-preview resume builder.

---

## ✨ Features

*   **Intelligent Resume Builder**: A real-time, live-preview builder with 14 professional, ATS-friendly templates (Minimalist, Executive, Modern, Creative, Tech, etc.).
*   **AI Resume Scanner**: Upload your existing PDF resume and let Groq AI analyze your strengths, weaknesses, and overall ATS score.
*   **JD Matcher (Job Description Analysis)**: Paste a Job Description, and the AI will analyze the core skills required, suggest matching resume tweaks, and recommend certifications.
*   **Smart Form Inputs**: Includes a worldwide location autocomplete (via Nominatim), a searchable international phone code dropdown, and smart job title suggestions.
*   **Export to PDF**: Generate high-quality, pixel-perfect PDF resumes instantly.

---

## 🛠️ Tech Stack

**Frontend:**
*   React.js (Vite)
*   Vanilla CSS (Modern UI, Glassmorphism, Responsive Design)
*   Lucide React (Icons)
*   Framer Motion (Animations)

**Backend:**
*   Python (FastAPI)
*   Uvicorn
*   Groq API (openai/gpt-oss & qwen models)
*   PyPDF2 & pypdf (PDF Extraction)
*   Tesseract OCR (scanned PDFs & images)

**Database & Auth:**
*   Supabase (PostgreSQL)

---

## ⚙️ Local Setup Instructions

Follow these steps to run ResuScan AI locally on your machine.

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   API Keys for Groq and Supabase

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/resuscan-ai.git
cd resuscan-ai
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and run the FastAPI server.
```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
# source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory with your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

> If `SUPABASE_URL`/`SUPABASE_KEY` are omitted, the backend still starts; database-backed profile features are simply disabled.

Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the Vite dev server.
```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The frontend will run at `http://localhost:5173/` and connect to the backend at `http://localhost:8000/`.

> **Windows note:** if `npm run dev` fails with *"npm.ps1 cannot be loaded because running scripts is disabled"*, either run `npm.cmd run dev`, or enable scripts once in PowerShell with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

## 🚀 Deployment

*   **Frontend**: Deployed seamlessly on [Vercel](https://vercel.com) using the included `vercel.json` configuration.
*   **Backend**: Designed to be deployed on platforms like [Render](https://render.com) or Koyeb using the included `render.yaml` and `requirements.txt`.

*(Remember to set `VITE_API_BASE` in your frontend deployment environment variables to point to your live backend URL).*

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
