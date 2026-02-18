<div align="center">

# 🎓 AI Counsellor

### Intelligent Study-Abroad Advisory Platform

An AI-powered platform that guides students through their entire university application journey — from profile building to application tracking — with an agentic AI counsellor that understands context and takes actions.

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq_LLM-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com)

[**Live Demo →**](https://ai-counsellor-kappa.vercel.app/#/)

</div>

---

## ✨ What Makes This Different

- **Agentic AI Counsellor** — Not just a chatbot. The AI parses user intent, extracts structured actions (lock a university, create a task, search for schools), and executes them *within the system* in real-time.
- **Dynamic Match Scoring** — Universities are ranked with personalized probability-fit scores based on GPA, test scores, budget, and preferred destinations — automatically classified into Dream / Target / Safe tiers.
- **Intelligent Task Generation** — Locking a university triggers automatic creation of a tailored application checklist (SOP, transcripts, forms, recommendations) with priority deadlines.
- **Profile-Gated Progression** — Stage-based journey (Discovery → Shortlist → Application → Departure) with profile strength analysis that gates access to advanced features.
- **Glassmorphism Design System** — Premium UI with translucent panels, vibrant gradients, and smooth Framer Motion animations.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS · Zustand · Framer Motion |
| **Backend** | FastAPI · SQLAlchemy · Pydantic v2 · Python 3.10+ |
| **AI Engine** | Groq API (Llama-3.3-70b-versatile) · Custom prompt engineering · Action extraction pipeline |
| **Database** | PostgreSQL with UUID primary keys · Relational schema with cascading deletes |
| **Auth** | JWT (python-jose) · bcrypt password hashing |
| **Deployment** | Vercel (frontend) · Render (backend) · CI/CD via Git |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Vercel)              │
│  React 19 + Vite + TypeScript + Zustand Stores  │
│  Views: Landing · Auth · Onboarding · Dashboard │
│         Discovery · Shortlist · Tracker · Chat  │
└─────────────────┬───────────────────────────────┘
                  │ REST API (Axios)
┌─────────────────▼───────────────────────────────┐
│                  Backend (Render)                │
│           FastAPI + SQLAlchemy ORM               │
│  Routers: auth · profile · universities · ai    │
│  Services: ai_engine · university_service        │
└──────┬──────────────────────┬───────────────────┘
       │                      │
┌──────▼──────┐     ┌────────▼────────┐
│ PostgreSQL  │     │  Groq API       │
│ (Database)  │     │  Llama-3.3-70b  │
└─────────────┘     └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  HiPolabs API   │
                    │ (University DB) │
                    └─────────────────┘
```

> 📖 **For a deep technical breakdown, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ &nbsp;·&nbsp; **Python** 3.10+ &nbsp;·&nbsp; **PostgreSQL** database

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env    # Edit with your DATABASE_URL, JWT_SECRET, GROQ_API_KEY

python init_db.py       # Initialize database tables
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # Opens at http://localhost:3000
```

---

## 📁 Project Structure

```
AI Counsellor/
├── frontend/                   # React 19 + Vite + TypeScript
│   ├── views/                  # Page components
│   │   ├── Landing.tsx         #   Marketing landing page
│   │   ├── Auth.tsx            #   Login / Signup
│   │   ├── Onboarding.tsx      #   4-step profile builder
│   │   ├── Dashboard.tsx       #   Central hub with metrics
│   │   ├── Discovery.tsx       #   University search + AI recommendations
│   │   ├── Shortlist.tsx       #   Manage & compare universities
│   │   ├── Tracker.tsx         #   Application task management
│   │   ├── Chat.tsx            #   AI counsellor conversation
│   │   └── Profile.tsx         #   Full profile editor
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx          #   App shell + navigation
│   │   ├── SmartStrategy.tsx   #   Strategy recommendations widget
│   │   └── AppTour.tsx         #   Guided onboarding tour
│   ├── store/                  # Zustand state management
│   │   ├── authStore.ts        #   Authentication state + JWT
│   │   ├── universityStore.ts  #   University data + shortlist
│   │   └── taskStore.ts        #   Task management state
│   └── services/               # API client layer
│
├── backend/                    # FastAPI + Python
│   ├── main.py                 # App entry point + CORS + lifespan
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── routers/                # API endpoint handlers
│   │   ├── auth.py             #   JWT signup/login/me
│   │   ├── profile.py          #   Profile CRUD + onboarding
│   │   ├── universities.py     #   Search, recommend, shortlist, lock
│   │   ├── ai.py               #   Chat, profile analysis, next steps
│   │   └── tasks.py            #   CRUD + auto-generation on lock
│   └── services/               # Business logic layer
│       ├── ai_engine.py        #   Groq integration + action pipeline
│       └── university_service.py  # HiPolabs API + match scoring
│
├── ARCHITECTURE.md             # Full technical documentation
└── README.md                   # ← You are here
```

---

## 🎯 Core Features

| Feature | Description |
|---|---|
| **AI Counsellor Chat** | Context-aware assistant powered by Llama-3.3-70b that can search universities, lock schools, and create tasks directly from conversation |
| **University Discovery** | Smart matching engine with probability-fit scores, tiered classification (Dream/Target/Safe), and personalized admission analysis |
| **Strategic Shortlisting** | Compare shortlisted universities with AI-enriched data (tuition estimates, acceptance rates, scholarship probabilities) |
| **Application Tracker** | Auto-generated checklists when universities are locked — SOP, transcripts, forms, recommendations with deadline tracking |
| **Profile Intelligence** | Real-time profile strength analysis with visual tiers and actionable recommendations to improve readiness |
| **Guided Onboarding** | 4-step wizard + interactive app tour capturing academics, goals, budget, and exam readiness |
| **Stage Progression** | Journey phases (Discovery → Shortlist → Application → Departure) with profile-gated access to advanced tools |

---

## 📄 License

MIT

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/pruthvijain41">Pruthvi</a></sub>
</div>
