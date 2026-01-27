from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import User, Profile, Shortlist, Task
from schemas import ChatRequest, ChatResponse, ProfileAnalysis
from routers.auth import get_current_user
from services.ai_engine import AIEngine
from services.university_service import UniversityService

router = APIRouter()
ai_engine = AIEngine()
university_service = UniversityService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_counsellor(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with the AI Counsellor"""
    # Get user profile and context
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    shortlists = db.query(Shortlist).filter(Shortlist.user_id == current_user.id).all()
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    
    if not profile or not profile.onboarding_completed:
        return ChatResponse(
            response="Please complete your onboarding first to unlock the AI Counsellor features.",
            actions_taken=[]
        )
    
    # Build context for AI
    context = {
        "user_name": current_user.name,
        "profile": {
            "education_level": profile.education_level,
            "degree": profile.degree,
            "major": profile.major,
            "gpa": float(profile.gpa) if profile.gpa else None,
            "intended_degree": profile.intended_degree,
            "field_of_study": profile.field_of_study,
            "target_intake": profile.target_intake,
            "preferred_countries": profile.preferred_countries,
            "budget_min": profile.budget_min,
            "budget_max": profile.budget_max,
            "funding_type": profile.funding_type,
            "ielts_status": profile.ielts_status,
            "ielts_score": float(profile.ielts_score) if profile.ielts_score else None,
            "gre_status": profile.gre_status,
            "gre_score": profile.gre_score,
            "sop_status": profile.sop_status,
            "current_stage": profile.current_stage
        },
        "shortlisted_universities": [
            {
                "id": str(s.id),
                "name": s.university_name,
                "country": s.country,
                "status": s.status,
                "enriched_data": s.enriched_data
            }
            for s in shortlists
        ],
        "pending_tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "type": t.type,
                "is_completed": t.is_completed
            }
            for t in tasks if not t.is_completed
        ]
    }
    
    # Process message with AI
    response = await ai_engine.process_message(
        message=chat_request.message,
        context=context,
        conversation_history=chat_request.conversation_history,
        db=db,
        current_user=current_user
    )
    
    return response

@router.get("/analyze-profile", response_model=ProfileAnalysis)
async def analyze_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI analysis of user's profile strength"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )
    
    analysis = await ai_engine.analyze_profile(profile)
    return analysis

@router.get("/next-steps")
async def get_next_steps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-recommended next steps based on current stage"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    shortlists = db.query(Shortlist).filter(Shortlist.user_id == current_user.id).all()
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_completed == False
    ).all()
    
    if not profile:
        return {
            "current_stage": "PROFILE",
            "next_steps": ["Complete your profile to get started"]
        }
    
    next_steps = []
    
    if not profile.onboarding_completed:
        next_steps.append("Complete onboarding to unlock all features")
    elif profile.current_stage == "DISCOVERY":
        next_steps.append("Explore universities that match your profile")
        if profile.preferred_countries:
            next_steps.append(f"Search for universities in {', '.join(profile.preferred_countries[:2])}")
        next_steps.append("Shortlist universities you're interested in")
    elif profile.current_stage == "SHORTLIST":
        shortlist_count = len(shortlists)
        next_steps.append(f"You have {shortlist_count} universities shortlisted")
        next_steps.append("Review your shortlisted universities")
        next_steps.append("Lock at least one university to proceed to applications")
    elif profile.current_stage in ["LOCKED", "APPLICATION"]:
        locked_count = sum(1 for s in shortlists if s.status == "LOCKED")
        pending_count = sum(1 for t in tasks if not t.is_completed)
        next_steps.append(f"You have {locked_count} locked universities")
        next_steps.append(f"Complete your {pending_count} pending tasks")
        if not tasks:
            next_steps.append("Generate application tasks for your locked universities")
    
    return {
        "current_stage": profile.current_stage,
        "onboarding_completed": profile.onboarding_completed,
        "next_steps": next_steps
    }
