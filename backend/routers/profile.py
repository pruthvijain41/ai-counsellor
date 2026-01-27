from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import User, Profile
from schemas import ProfileResponse, ProfileUpdate, CompleteOnboarding
from routers.auth import get_current_user

router = APIRouter()

@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.put("", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update only provided fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    # Auto-complete onboarding if required fields are filled
    # Required: education_level AND intended_degree
    if not profile.onboarding_completed:
        if profile.education_level and profile.intended_degree:
            profile.onboarding_completed = True
            if profile.current_stage == "PROFILE":
                profile.current_stage = "DISCOVERY"
    
    db.commit()
    db.refresh(profile)
    
    return profile

@router.post("/complete-onboarding", response_model=ProfileResponse)
async def complete_onboarding(
    onboarding_data: CompleteOnboarding,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update all onboarding fields
    for field, value in onboarding_data.model_dump().items():
        setattr(profile, field, value)
    
    # Mark onboarding as complete and advance stage
    profile.onboarding_completed = True
    profile.current_stage = "DISCOVERY"
    
    db.commit()
    db.refresh(profile)
    
    return profile

@router.get("/onboarding-status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return {"completed": False, "current_stage": "PROFILE"}
    
    return {
        "completed": profile.onboarding_completed,
        "current_stage": profile.current_stage
    }

@router.post("/update-stage")
async def update_stage(
    stage: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_stages = ["PROFILE", "DISCOVERY", "SHORTLIST", "LOCKED", "APPLICATION"]
    if stage not in valid_stages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage. Must be one of: {valid_stages}"
        )
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    profile.current_stage = stage
    db.commit()
    
    return {"message": f"Stage updated to {stage}", "current_stage": stage}
