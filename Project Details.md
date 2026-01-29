# AI Counsellor - Project Details

## 🚀 Project Overview
**AI Counsellor** is a premium, AI-powered study abroad platform designed to guide students through their entire university application journey. It combines a high-end "Glassmorphism" UI with advanced AI agents to provide personalized university recommendations, application strategy, and task management.

---

## ✨ Key Features

### 1. **Intelligent Dashboard**
   - **Central Hub**: A visually stunning command center aggregating all critical metrics.
   - **Profile Strength Widget**: Real-time analysis of the user's readiness (GPA, Exams, SOP) with visual tiers (e.g., "TIER 2 PRIME").
   - **Mission Phase Tracker**: Tracks the user's journey stage (Discovery → Shortlist → Application → Departure).
   - **Smart Notifications**: Context-aware alerts for pending tasks and deadlines.

### 2. **AI-Powered University Discovery**
   - **Smart Matching Engine**: Automatically prioritizes universities based on the user's **Preferred Destinations**.
   - **Admissions Protocol Analysis**: Detailed, personalized breakdowns of *why* a university fits the user, mentioning their specific major and trajectory.
   - **Dynamic Match Scores**: Calculates a "Probability Fit" (e.g., 94.8% OPTIMAL) based on GPA, GRE/IELTS scores, and Budget.
   - **Tiered Classification**: Categorizes schools into **Dream**, **Target**, and **Safe** zones automatically.

### 3. **Strategic Shortlisting**
   - **Shortlist Manager**: A drag-and-drop style interface to manage prospective universities.
   - **Lock & Apply Protocol**: "Locking" a university changes the user's global status to "Application Phase" and triggers the generation of specific tasks.
   - **Financial Strategy**: View estimated tuition and scholarship probabilities for shortlisted schools.

### 4. **Automated Task Tracker**
   - **Intelligent Task Generation**: When a university is "Locked," the system automatically populates the tracker with a tailored checklist (SOP, Application Forms, Transcripts, Recommendations).
   - **Critical Milestones**: A timeline view of upcoming high-priority deadlines.
   - **Cleanup Logic**: Unlocking or removing a university automatically cleans up associated tasks to keep the tracker focused.

### 5. **AI Counsellor Chat**
   - **Context-Aware Assistant**: A Groq (Llama 3.3) powered agent that knows the user's profile, shortlist, and tasks.
   - **Action-Taking**: The AI can perform system actions like "Lock Stanford", "Add task to write SOP," or "Search for Safe schools in Canada" directly from the chat.
   - **Fallback Architecture**: Robust logic ensuring key features (like task generation) work even if the AI API is temporarily offline.

### 6. **Comprehensive Profile System**
   - **Holistic Data**: Captures Academic History, Test Scores (IELTS/TOEFL, GRE/GMAT), Work Experience, and Preferences.
   - **Dynamic Validation**: Ensures exam scores match the specific scale of the selected exam type.
   - **Profile Gating**: Limits access to advanced tools until the profile reaches a specific readiness threshold (>75%).

---

## 🛠 Technical Architecture

### **Frontend (Vercel)**
- **Framework**: React 18 + Vite (High-performance build)
- **Styling**: Tailwind CSS + Custom CSS Variables for specific "Glassmorphism" effects (blur, translucency, gradients).
- **State Management**: Zustand (Global stores for Auth, University, Tasks).
- **Icons**: Material Symbols Outlined (Google Fonts).
- **Design System**: "Light Glassmorphism" - clean, white/translucent panels with vibrant accent gradients (Orange/Emerald).

### **Backend (Render)**
- **Framework**: FastAPI (Python) - High-performance async API.
- **Database**: PostgreSQL (SQLAlchemy ORM).
- **AI Engine**: Groq API (Llama-3.3-70b-versatile) for ultra-fast inference.
- **Services**:
    - `university_service`: Handles HiPolabs API integration, enrichment, and match logic.
    - `ai_engine`: Manages chat context, prompt engineering, and action execution triggers.

### **Integrations**
- **HiPolabs**: Open-source university domain data.
- **Groq**: Large Language Model provider.
- **PostgreSQL**: Relational data persistence.

---

## 🔒 Security & Deployment
- **CORS Protection**: Configured for specific frontend domains.
- **Environment Variables**: Managed via `.env` (local) and platform secrets (Vercel/Render).
- **Git Integration**: Automated CI/CD pipelines linked to the `main` branch.

## 🔗 Live Deployments
- **Frontend**: `https://ai-counsellor-psclib8kl-pruthvi-s-projects-fc4c2a60.vercel.app`
- **Backend**: (Hosted on Render - specific URL configured in Frontend environment)
