from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import httpx

from database import get_db
from models import User, Profile, Shortlist, Task
from schemas import ShortlistCreate, ShortlistResponse, UniversityResponse
from routers.auth import get_current_user
from services.university_service import UniversityService
from config import get_settings

router = APIRouter()
settings = get_settings()
university_service = UniversityService()

@router.get("/search", response_model=List[UniversityResponse])
async def search_universities(
    country: str = Query(..., description="Country to search universities in"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search universities by country and enrich with AI data"""
    # Get user profile for personalized recommendations
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Fetch and enrich universities
    universities = await university_service.search_and_enrich(country, profile)
    
    return universities

@router.get("/recommendations", response_model=List[UniversityResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered university recommendations based on user profile"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile or not profile.preferred_countries:
        raise HTTPException(
            status_code=400,
            detail="Please complete your profile with preferred countries first"
        )
    
    all_recommendations = []
    for country in profile.preferred_countries[:3]:  # Limit to top 3 countries
        universities = await university_service.search_and_enrich(country, profile)
        all_recommendations.extend(universities[:10])  # Top 10 per country
    
    # Sort by match score
    all_recommendations.sort(
        key=lambda x: x.get("enriched_data", {}).get("match_score", 0) if isinstance(x, dict) else 0,
        reverse=True
    )
    
    return all_recommendations[:20]  # Return top 20 overall

@router.post("/shortlist", response_model=ShortlistResponse)
async def shortlist_university(
    shortlist_data: ShortlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a university to user's shortlist"""
    # Check if already shortlisted
    existing = db.query(Shortlist).filter(
        Shortlist.user_id == current_user.id,
        Shortlist.university_name == shortlist_data.university_name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="University already in shortlist"
        )
    
    # Create shortlist entry
    shortlist = Shortlist(
        user_id=current_user.id,
        university_name=shortlist_data.university_name,
        country=shortlist_data.country,
        alpha_two_code=shortlist_data.alpha_two_code,
        web_pages=shortlist_data.web_pages,
        domains=shortlist_data.domains,
        enriched_data=shortlist_data.enriched_data,
        status="SHORTLISTED"
    )
    
    db.add(shortlist)
    
    # Update user stage if needed
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile and profile.current_stage == "DISCOVERY":
        profile.current_stage = "SHORTLIST"
    
    db.commit()
    db.refresh(shortlist)
    
    return shortlist

@router.get("/shortlist", response_model=List[ShortlistResponse])
async def get_shortlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's shortlisted universities"""
    shortlists = db.query(Shortlist).filter(
        Shortlist.user_id == current_user.id
    ).order_by(Shortlist.created_at.desc()).all()
    
    return shortlists

@router.post("/lock/{shortlist_id}", response_model=ShortlistResponse)
async def lock_university(
    shortlist_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lock a university - commits the user to this university for application"""
    shortlist = db.query(Shortlist).filter(
        Shortlist.id == shortlist_id,
        Shortlist.user_id == current_user.id
    ).first()
    
    if not shortlist:
        raise HTTPException(
            status_code=404,
            detail="Shortlisted university not found"
        )
    
    if shortlist.status == "LOCKED":
        raise HTTPException(
            status_code=400,
            detail="University is already locked"
        )
    
    # Lock the university
    shortlist.status = "LOCKED"
    shortlist.locked_at = datetime.utcnow()
    
    # Update user stage to LOCKED/APPLICATION
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.current_stage = "APPLICATION"
    
    # Auto-generate default tasks for this university
    default_tasks = [
        {"title": f"Complete Application Form - {shortlist.university_name}", "type": "FORM", "priority": "HIGH"},
        {"title": f"Write Statement of Purpose - {shortlist.university_name}", "type": "SOP", "priority": "HIGH"},
        {"title": f"Gather Transcripts & Documents - {shortlist.university_name}", "type": "DOC", "priority": "MEDIUM"},
        {"title": f"Request Letters of Recommendation - {shortlist.university_name}", "type": "DOC", "priority": "MEDIUM"},
        {"title": f"Pay Application Fee - {shortlist.university_name}", "type": "FORM", "priority": "HIGH"},
    ]
    
    for task_data in default_tasks:
        new_task = Task(
            user_id=current_user.id,
            university_id=shortlist.id,
            title=task_data["title"],
            type=task_data["type"],
            priority=task_data["priority"],
            deadline=datetime.utcnow() + timedelta(days=30)  # Default 30 day deadline
        )
        db.add(new_task)
    
    db.commit()
    db.refresh(shortlist)
    
    return shortlist

@router.post("/unlock/{shortlist_id}", response_model=ShortlistResponse)
async def unlock_university(
    shortlist_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock a university - allows user to reconsider"""
    shortlist = db.query(Shortlist).filter(
        Shortlist.id == shortlist_id,
        Shortlist.user_id == current_user.id
    ).first()
    
    if not shortlist:
        raise HTTPException(
            status_code=404,
            detail="Shortlisted university not found"
        )
    
    if shortlist.status != "LOCKED":
        raise HTTPException(
            status_code=400,
            detail="University is not locked"
        )
    
    # Delete all tasks associated with this university
    db.query(Task).filter(
        Task.university_id == shortlist_id,
        Task.user_id == current_user.id
    ).delete()
    
    # Unlock the university
    shortlist.status = "SHORTLISTED"
    shortlist.locked_at = None
    
    # Check if any other universities are still locked
    other_locked = db.query(Shortlist).filter(
        Shortlist.user_id == current_user.id,
        Shortlist.status == "LOCKED",
        Shortlist.id != shortlist_id
    ).first()
    
    # If no other locked universities, revert stage
    if not other_locked:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile:
            profile.current_stage = "SHORTLIST"
    
    db.commit()
    db.refresh(shortlist)
    
    return shortlist

@router.delete("/shortlist/{shortlist_id}")
async def remove_from_shortlist(
    shortlist_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a university from shortlist"""
    shortlist = db.query(Shortlist).filter(
        Shortlist.id == shortlist_id,
        Shortlist.user_id == current_user.id
    ).first()
    
    if not shortlist:
        raise HTTPException(
            status_code=404,
            detail="Shortlisted university not found"
        )
    
    if shortlist.status == "LOCKED":
        raise HTTPException(
            status_code=400,
            detail="Cannot remove a locked university. Unlock it first."
        )
    
    # Delete any associated tasks (safety net for orphaned tasks)
    db.query(Task).filter(
        Task.university_id == shortlist_id,
        Task.user_id == current_user.id
    ).delete()
    
    db.delete(shortlist)
    db.commit()
    
    return {"message": "University removed from shortlist"}
