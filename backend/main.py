from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from routers import auth, profile, universities, ai, tasks
from database import engine
from models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Create all tables on startup
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables ready!")
    yield
    # Cleanup on shutdown
    print("Shutting down...")

app = FastAPI(
    title="AI Counsellor API",
    description="Backend API for the AI Counsellor study-abroad platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(universities.router, prefix="/api/universities", tags=["Universities"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Counsellor"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])

@app.get("/")
async def root():
    return {"message": "AI Counsellor API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
