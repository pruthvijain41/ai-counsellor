# AI Counsellor - Study Abroad Platform

A guided, stage-based platform to help students make confident study-abroad decisions.

## Project Structure

```
AI Counsellor/
├── frontend/          # Next.js 14 frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/
│   │   ├── lib/       # API utilities
│   │   └── store/     # Zustand state
│   └── ...
├── backend/           # FastAPI backend
│   ├── routers/       # API endpoints
│   ├── services/      # Business logic
│   ├── models.py      # SQLAlchemy models
│   └── ...
└── README.md
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **AI**: Google Gemini Pro
- **External API**: HiPolabs Universities API

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and Gemini API key
```

5. Initialize database:
```bash
python init_db.py
```

6. Start the server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Features

### Core Flow

1. **Landing Page** - Product overview and CTAs
2. **Authentication** - Signup/Login with JWT
3. **Onboarding** - 4-step profile building
4. **Dashboard** - Stage tracking and profile strength
5. **AI Counsellor** - Chat-based guidance
6. **Discovery** - University search and recommendations
7. **Shortlist** - Save and compare universities
8. **Locking** - Commit to universities
9. **Application** - Task tracking and guidance

### AI Features

- Profile strength analysis
- Personalized university recommendations
- Dream/Target/Safe classification
- Chat-based counselling
- Automated task generation

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/complete-onboarding` - Complete onboarding

### Universities
- `GET /api/universities/search?country=` - Search universities
- `GET /api/universities/recommendations` - Get recommendations
- `POST /api/universities/shortlist` - Add to shortlist
- `POST /api/universities/lock/{id}` - Lock university
- `POST /api/universities/unlock/{id}` - Unlock university

### AI
- `POST /api/ai/chat` - Chat with counsellor
- `GET /api/ai/analyze-profile` - Profile analysis
- `GET /api/ai/next-steps` - Get next steps

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `POST /api/tasks/generate` - Generate tasks

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ai_counsellor
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Schema

- **users** - User accounts
- **profiles** - User profiles with onboarding data
- **shortlists** - Shortlisted universities
- **tasks** - Application tasks

## License

MIT
