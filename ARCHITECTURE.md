# Architecture — AI Counsellor

> Complete technical documentation for the AI Counsellor study-abroad advisory platform.

---

## Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [AI Engine Deep Dive](#ai-engine-deep-dive)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [User Journey](#user-journey)
- [Deployment](#deployment)
- [Security](#security)

---

## System Overview

AI Counsellor is a full-stack platform that pairs a premium Glassmorphism UI with an **agentic AI backend** to guide students through university discovery, shortlisting, and application tracking. The AI doesn't just answer questions — it interprets user intent, extracts structured actions, and executes them against the database in real-time.

### High-Level Architecture

```
                          ┌──────────────────────┐
                          │       Client         │
                          │   (Browser / SPA)    │
                          └──────────┬───────────┘
                                     │ HTTPS
                          ┌──────────▼───────────┐
                          │   Vercel CDN / Edge  │
                          │   (Static Frontend)  │
                          │   React 19 + Vite    │
                          └──────────┬───────────┘
                                     │ REST API (Axios)
                          ┌──────────▼───────────┐
                          │   Render Server      │
                          │   FastAPI Backend     │
                          │                      │
                          │  ┌────────────────┐  │
                          │  │    Routers     │  │
                          │  │ auth · profile │  │
                          │  │ universities   │  │
                          │  │ ai · tasks     │  │
                          │  └───────┬────────┘  │
                          │          │           │
                          │  ┌───────▼────────┐  │
                          │  │   Services     │  │
                          │  │ ai_engine      │  │
                          │  │ university_svc │  │
                          │  └──┬─────────┬───┘  │
                          └─────┼─────────┼──────┘
                                │         │
                   ┌────────────▼──┐  ┌───▼──────────────┐
                   │  PostgreSQL   │  │   External APIs   │
                   │  (Render DB)  │  │  Groq · HiPolabs  │
                   └───────────────┘  └──────────────────┘
```

### Request Flow

1. User interacts with the React SPA hosted on Vercel
2. Frontend Zustand stores dispatch API calls via Axios to the FastAPI backend
3. Backend routers validate requests (JWT auth + Pydantic schemas)
4. Services layer handles business logic — AI inference, university matching, task generation
5. SQLAlchemy ORM persists data to PostgreSQL with UUID primary keys

---

## Frontend Architecture

### Technology

| Component | Choice | Why |
|---|---|---|
| Framework | React 19 | Latest concurrent features, hooks-first |
| Build Tool | Vite 6 | Sub-second HMR, optimized production builds |
| Language | TypeScript | Type safety across all stores, services, and views |
| State | Zustand 5 | Minimal boilerplate, no provider wrapping, selector-based reactivity |
| Styling | Tailwind CSS + Custom CSS | Glassmorphism effects (blur, translucency, gradients) |
| Animations | Framer Motion | Declarative enter/exit animations, layout transitions |
| Routing | React Router v7 | Hash router for SPA on static hosting |
| Charts | Recharts 3 | Dashboard analytics visualizations |
| Icons | Lucide React | Consistent icon system |

### Design System — "Light Glassmorphism"

The UI uses a custom design language built on:

- **Translucent panels** with `backdrop-filter: blur()` and semi-transparent backgrounds
- **Vibrant accent gradients** — Orange and Emerald used as primary interaction colours
- **Premium typography** via Google Fonts (Material Symbols Outlined for iconography)
- **Micro-animations** — Framer Motion page transitions, hover effects, and loading states

### View Architecture

| View | File | Purpose |
|---|---|---|
| Landing | `Landing.tsx` | Marketing page with CTAs and feature showcase |
| Auth | `Auth.tsx` | Login/Signup forms with JWT token handling |
| Onboarding | `Onboarding.tsx` | 4-step wizard: Academics → Goals → Budget → Exams |
| Voice Onboarding | `VoiceOnboarding.tsx` | Alternative voice-based profile setup |
| Dashboard | `Dashboard.tsx` | Central hub — profile strength, stage tracker, notifications |
| Discovery | `Discovery.tsx` | University search with AI match scores and tier badges |
| Shortlist | `Shortlist.tsx` | Compare universities, view enriched data, lock/unlock |
| Tracker | `Tracker.tsx` | Application task management with deadlines and priorities |
| Chat | `Chat.tsx` | Real-time AI counsellor conversation interface |
| Profile | `Profile.tsx` | Full profile editor with dynamic validation |

### State Management (Zustand)

Three global stores manage application state:

```
authStore.ts          — User session, JWT tokens, login/signup/logout
universityStore.ts    — University search results, shortlist, lock/unlock state
taskStore.ts          — Task CRUD, auto-generated tasks, completion tracking
```

All stores use Axios interceptors to attach JWT tokens to every request and handle 401 redirects.

### Component Layer

| Component | Purpose |
|---|---|
| `Layout.tsx` | App shell with sidebar navigation, responsive breakpoints |
| `SmartStrategy.tsx` | AI-powered strategy recommendations widget |
| `AppTour.tsx` | Interactive guided tour (react-joyride) for first-time users |
| `LockedOverlay.tsx` | Gate overlay for profile-locked features |
| `MobileBlocker.tsx` | Desktop-only notice for unsupported viewports |

---

## Backend Architecture

### Technology

| Component | Choice | Why |
|---|---|---|
| Framework | FastAPI | Async-first, automatic OpenAPI docs, Pydantic integration |
| ORM | SQLAlchemy 2.0 | Mature, supports UUID columns, relationships, cascading deletes |
| Validation | Pydantic v2 | Request/response schema validation with type coercion |
| Auth | python-jose + passlib | JWT token generation + bcrypt password hashing |
| AI Client | Groq SDK | Ultra-fast inference with Llama-3.3-70b-versatile model |
| HTTP Client | httpx | Async HTTP for external API calls (HiPolabs) |
| Database Driver | psycopg2-binary | PostgreSQL adapter for SQLAlchemy |

### Router Layer

FastAPI routers handle request parsing, auth dependency injection, and response formatting.

| Router | Prefix | Endpoints |
|---|---|---|
| `auth.py` | `/api/auth` | `POST /signup` · `POST /login` · `GET /me` |
| `profile.py` | `/api/profile` | `GET /` · `PUT /` · `POST /complete-onboarding` |
| `universities.py` | `/api/universities` | `GET /search` · `GET /recommendations` · `POST /shortlist` · `POST /lock/{id}` · `POST /unlock/{id}` · `DELETE /shortlist/{id}` |
| `ai.py` | `/api/ai` | `POST /chat` · `GET /analyze-profile` · `GET /next-steps` |
| `tasks.py` | `/api/tasks` | `GET /` · `POST /` · `PUT /{id}` · `POST /generate` · `DELETE /{id}` |

### Services Layer

Business logic is isolated from the router layer into dedicated service classes:

**`ai_engine.py`** (854 lines) — The core AI orchestration engine. See [AI Engine Deep Dive](#ai-engine-deep-dive).

**`university_service.py`** — Handles:
- HiPolabs API integration for university domain data
- AI-powered enrichment (tuition estimates, acceptance rates, scholarship probabilities)
- Match scoring algorithm based on GPA, test scores, budget, and preferred countries
- Dream / Target / Safe tier classification

---

## AI Engine Deep Dive

The AI engine (`services/ai_engine.py`) is the most technically complex component. It implements an **agentic architecture** where the LLM can both respond conversationally *and* trigger system-level actions.

### Pipeline

```
User Message
     │
     ▼
┌─────────────────┐
│ Build System     │  ← Injects user profile, shortlist, tasks,
│ Prompt           │    stage, and preferences into the prompt
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Groq API Call    │  ← Llama-3.3-70b-versatile inference
│ (with history)   │    Includes full conversation history
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Actions  │  ← Regex + NLP parsing to identify
│ from Response    │    structured action intents
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Execute Actions  │  ← Database mutations: lock universities,
│ in Database      │    create tasks, update shortlist
└────────┬────────┘
         │
         ▼
   Chat Response + Action Confirmations
```

### Key Methods

| Method | Responsibility |
|---|---|
| `process_message()` | Main entry — orchestrates the full pipeline |
| `_build_system_prompt()` | Constructs context-rich prompt from user state (profile, shortlist, tasks) |
| `_extract_actions()` | Parses AI response + user message to identify actionable intents (lock, shortlist, create task, search) |
| `_execute_actions()` | Executes extracted actions against the database — creates shortlists, locks universities, generates tasks |
| `_auto_shortlist()` | Automatically discovers and shortlists universities matching the user's profile |
| `_fallback_response()` | Provides helpful responses + still executes actions when the Groq API is unavailable |
| `analyze_profile()` | Computes profile strength score with category breakdowns and recommendations |
| `_get_recommendations()` | Generates personalized university recommendations based on profile analysis |

### Action Types

The AI can extract and execute these action types from natural language:

| Action | Trigger Example | System Effect |
|---|---|---|
| `lock_university` | "Lock Stanford" | Changes university status to LOCKED, triggers task generation |
| `unlock_university` | "Unlock MIT" | Reverts to SHORTLISTED, cleans up associated tasks |
| `shortlist_university` | "Add Harvard to my list" | Creates shortlist entry with AI-enriched data |
| `remove_shortlist` | "Remove Stanford" | Deletes shortlist entry and cascading tasks |
| `create_task` | "Remind me to write my SOP" | Creates task with title, description, priority |
| `search_universities` | "Find safe schools in Canada" | Queries HiPolabs + AI enrichment pipeline |

### Fallback Architecture

The engine is designed to degrade gracefully:

1. **Groq API available** → Full AI conversation + action extraction + execution
2. **Groq API unavailable** → Pattern-matched fallback responses + action extraction still works from user message parsing
3. **Action execution failure** → Individual action failures are caught; successful actions still persist

---

## Database Schema

### Entity Relationship

```
┌──────────────┐       ┌──────────────────────────────────────┐
│    Users     │       │              Profiles                │
├──────────────┤       ├──────────────────────────────────────┤
│ id (UUID PK) │──1:1──│ user_id (FK)                         │
│ email        │       │ education_level · degree · major      │
│ name         │       │ gpa · graduation_year                │
│ password_hash│       │ intended_degree · field_of_study      │
│ created_at   │       │ target_intake · preferred_countries   │
└──────┬───────┘       │ budget_min · budget_max · funding     │
       │               │ ielts_* · toefl_* · gre_* · gmat_*   │
       │               │ sop_status                            │
       │               │ current_stage · onboarding_completed  │
       │               └──────────────────────────────────────┘
       │
       │           ┌────────────────────────────┐
       │           │        Shortlists          │
       ├───1:N─────├────────────────────────────┤
       │           │ id (UUID PK)               │
       │           │ user_id (FK)               │
       │           │ university_name · country   │
       │           │ enriched_data (JSON)        │
       │           │    ├─ match_score           │
       │           │    ├─ match_type (Dream/    │
       │           │    │  Target/Safe)          │
       │           │    ├─ estimated_tuition     │
       │           │    └─ acceptance_rate       │
       │           │ status (SHORTLISTED/LOCKED) │
       │           └────────────┬───────────────┘
       │                        │
       │           ┌────────────▼───────────────┐
       │           │          Tasks             │
       └───1:N─────├────────────────────────────┤
                   │ id (UUID PK)               │
                   │ user_id (FK)               │
                   │ university_id (FK)          │
                   │ title · description         │
                   │ type (DOC/EXAM/FORM/SOP/    │
                   │       VISA/FINANCE)         │
                   │ priority (LOW/MEDIUM/HIGH)  │
                   │ deadline · is_completed     │
                   └────────────────────────────┘
```

### Key Design Decisions

- **UUID primary keys** — Avoids sequential ID enumeration; safe for client-side references
- **JSON enriched_data** — Flexible schema for AI-generated university metadata that evolves without migrations
- **Cascading deletes** — Removing a user cascades to profile, shortlists, and tasks automatically
- **Stage tracking on Profile** — `current_stage` field drives the entire UI flow and feature gating
- **Dual foreign keys on Tasks** — Tasks are linked to both the user *and* a specific shortlisted university

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account (email, name, password) → JWT token |
| `POST` | `/api/auth/login` | Authenticate → JWT token |
| `GET` | `/api/auth/me` | Get current user from JWT |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Retrieve full user profile |
| `PUT` | `/api/profile` | Update profile fields |
| `POST` | `/api/profile/complete-onboarding` | Mark onboarding as complete, advance stage |

### Universities

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/universities/search?country=` | Search universities by country via HiPolabs |
| `GET` | `/api/universities/recommendations` | AI-powered recommendations based on profile |
| `POST` | `/api/universities/shortlist` | Add university to shortlist with AI enrichment |
| `POST` | `/api/universities/lock/{id}` | Lock university → triggers task generation |
| `POST` | `/api/universities/unlock/{id}` | Unlock → revert status, clean up tasks |
| `DELETE` | `/api/universities/shortlist/{id}` | Remove from shortlist (cascades tasks) |

### AI Counsellor

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send message → AI response + executed actions |
| `GET` | `/api/ai/analyze-profile` | Get profile strength analysis with score breakdown |
| `GET` | `/api/ai/next-steps` | Get AI-generated next steps for current stage |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks (filterable by university) |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/{id}` | Update task (title, status, priority, deadline) |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `POST` | `/api/tasks/generate` | Auto-generate tasks for locked universities |

---

## User Journey

```
Landing Page                           Profile Editor
     │                                      ▲
     ▼                                      │ (anytime)
  Sign Up / Login ──── JWT ────┐            │
                               │            │
                          ┌────▼────┐       │
                          │Onboarding│──────┘
                          │ (4 steps)│
                          └────┬────┘
                               │
                          ┌────▼─────────────────────────────┐
                          │         Dashboard                │
                          │  Profile Strength · Stage Track  │
                          │  Smart Notifications             │
                          └────┬─────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │Discovery │  │   Chat   │  │ Profile  │
          │AI Search │  │  Agent   │  │  Editor  │
          │& Match   │  │ Actions  │  │          │
          └────┬─────┘  └──────────┘  └──────────┘
               │
          ┌────▼─────┐
          │Shortlist  │
          │Compare    │
          │Lock/Unlock│
          └────┬─────┘
               │ Lock triggers
          ┌────▼─────┐
          │ Tracker  │
          │Auto Tasks│
          │Deadlines │
          └──────────┘
```

### Stage Progression Rules

| Stage | Entry Condition | Unlocks |
|---|---|---|
| `PROFILE` | Account created | Onboarding, basic dashboard |
| `DISCOVERY` | Onboarding completed (profile > 75%) | University search, AI recommendations |
| `SHORTLIST` | First university shortlisted | Shortlist manager, comparison tools |
| `LOCKED` | First university locked | Task tracker, application management |
| `APPLICATION` | Tasks in progress | Full task management, deadline tracking |

---

## Deployment

### Frontend — Vercel

- **Build**: `vite build` → static output in `dist/`
- **Routing**: Hash router (`/#/`) for SPA compatibility on static hosting
- **Config**: `vercel.json` routes all paths to the SPA entry point
- **Environment**: `VITE_API_URL` points to Render backend

### Backend — Render

- **Runtime**: Python 3.10 (`runtime.txt`)
- **Start**: `uvicorn main:app --host 0.0.0.0 --port $PORT` (defined in `Procfile`)
- **Database**: Render-managed PostgreSQL instance
- **Environment**: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY` configured as Render secrets

### CI/CD

Both Vercel and Render are connected to the `main` branch — every push triggers automatic deployment.

---

## Security

| Layer | Implementation |
|---|---|
| **Authentication** | JWT tokens (python-jose) with configurable expiry |
| **Password Storage** | bcrypt hashing via passlib — passwords never stored in plaintext |
| **Authorization** | Every protected endpoint verifies JWT and extracts `current_user` |
| **CORS** | FastAPI middleware with configurable allowed origins |
| **Input Validation** | Pydantic v2 schemas validate all request bodies and query parameters |
| **Database** | Parameterized queries via SQLAlchemy ORM — no raw SQL injection vectors |
| **Secrets** | Environment variables on both platforms — `.env` files in `.gitignore` |
| **Cascade Protection** | `ondelete="CASCADE"` ensures orphan records are automatically cleaned up |

---

## Environment Variables

### Backend (`.env`)

```
DATABASE_URL=postgresql://user:password@host:5432/ai_counsellor
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-api-key
```

### Frontend (`.env.local`)

```
VITE_API_URL=http://localhost:8000
```

---

<div align="center">
  <sub>Last updated: February 2026</sub>
</div>
