# AI Resume Analyzer

A full-stack web app that analyzes resumes against job descriptions using Google Gemini AI. Get an ATS compatibility score, keyword match analysis, and actionable suggestions to improve your resume.

## Features

- Upload a PDF resume and paste a job description
- AI-powered analysis via Google Gemini
- ATS score with visual gauge
- Keyword match breakdown
- Tailored improvement suggestions
- User authentication (register/login)
- Analysis history per user

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router  
**Backend:** Node.js, Express, PostgreSQL, JWT auth  
**AI:** Google Gemini API (`@google/generative-ai`)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be at `http://localhost:5173` and the API at `http://localhost:5000`.

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description |
|---|---|
| `PORT` | Backend port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GEMINI_API_KEY` | Your Google Gemini API key |

## Project Structure

```
├── backend/
│   └── src/
│       ├── index.js          # Express server entry
│       ├── db.js             # PostgreSQL connection
│       ├── middleware/
│       │   └── auth.js       # JWT middleware
│       ├── routes/
│       │   ├── auth.js       # Register/login
│       │   ├── analyze.js    # Resume analysis
│       │   ├── tailor.js     # Resume tailoring
│       │   └── history.js    # Analysis history
│       └── services/
│           ├── gemini.js     # Gemini AI integration
│           └── pdfParser.js  # PDF text extraction
└── frontend/
    └── src/
        ├── pages/            # Landing, Analyzer, Result, History, Login, Register
        ├── components/       # ScoreGauge, KeywordBadges, SuggestionCard, Navbar
        ├── context/          # Auth context
        └── utils/            # API client
```
