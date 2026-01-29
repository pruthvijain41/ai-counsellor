from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class StageEnum(str, Enum):
    PROFILE = "PROFILE"
    DISCOVERY = "DISCOVERY"
    SHORTLIST = "SHORTLIST"
    LOCKED = "LOCKED"
    APPLICATION = "APPLICATION"

class FundingTypeEnum(str, Enum):
    SELF_FUNDED = "Self-funded"
    SCHOLARSHIP = "Scholarship-dependent"
    LOAN = "Loan-dependent"
    MIXED = "Mixed"

class ExamStatusEnum(str, Enum):
    NOT_STARTED = "Not started"
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In progress"
    COMPLETED = "Completed"

class SOPStatusEnum(str, Enum):
    NOT_STARTED = "Not started"
    DRAFT = "Draft"
    READY = "Ready"

class ShortlistStatusEnum(str, Enum):
    SHORTLISTED = "SHORTLISTED"
    LOCKED = "LOCKED"

class TaskTypeEnum(str, Enum):
    DOC = "DOC"
    EXAM = "EXAM"
    FORM = "FORM"
    SOP = "SOP"
    VISA = "VISA"
    FINANCE = "FINANCE"

class PriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: str
    supabase_user_id: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Profile Schemas
class ProfileBase(BaseModel):
    # Academic Background
    education_level: Optional[str] = None
    degree: Optional[str] = None
    major: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = Field(None, le=4.0, ge=0.0)
    
    # Study Goals
    intended_degree: Optional[str] = None
    field_of_study: Optional[str] = None
    target_intake: Optional[str] = None
    preferred_countries: Optional[List[str]] = None
    
    # Budget
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    funding_type: Optional[str] = None
    
    # Exam Readiness
    ielts_status: Optional[str] = None
    ielts_type: Optional[str] = None
    ielts_score: Optional[float] = None
    toefl_status: Optional[str] = None
    toefl_score: Optional[int] = None
    gre_status: Optional[str] = None
    gre_type: Optional[str] = None
    gre_score: Optional[int] = None
    gmat_status: Optional[str] = None
    gmat_score: Optional[int] = None
    sop_status: Optional[str] = None
    has_seen_tour: Optional[bool] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    onboarding_completed: bool
    has_seen_tour: bool
    current_stage: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Onboarding Schemas
class OnboardingStep1(BaseModel):
    """Academic Background"""
    education_level: str
    degree: str
    major: str
    graduation_year: int
    gpa: Optional[float] = Field(None, le=4.0, ge=0.0)

class OnboardingStep2(BaseModel):
    """Study Goals"""
    intended_degree: str
    field_of_study: str
    target_intake: str
    preferred_countries: List[str]

class OnboardingStep3(BaseModel):
    """Budget & Funding"""
    budget_min: int
    budget_max: int
    funding_type: str

class OnboardingStep4(BaseModel):
    """Exam Readiness"""
    ielts_status: str
    ielts_score: Optional[float] = None
    toefl_status: Optional[str] = None
    toefl_score: Optional[int] = None
    gre_status: Optional[str] = None
    gre_score: Optional[int] = None
    gmat_status: Optional[str] = None
    gmat_score: Optional[int] = None
    sop_status: str

class CompleteOnboarding(BaseModel):
    """Complete all onboarding data at once"""
    # Academic
    education_level: str
    degree: str
    major: str
    graduation_year: int
    gpa: Optional[float] = Field(None, le=4.0, ge=0.0)
    # Goals
    intended_degree: str
    field_of_study: str
    target_intake: str
    preferred_countries: List[str]
    # Budget
    budget_min: int
    budget_max: int
    funding_type: str
    # Exams
    ielts_status: str
    ielts_type: Optional[str] = "IELTS"
    ielts_score: Optional[float] = None
    gre_status: Optional[str] = None
    gre_type: Optional[str] = "GRE"
    gre_score: Optional[int] = None
    sop_status: str

# University Schemas
class UniversityBase(BaseModel):
    name: str
    country: str
    alpha_two_code: Optional[str] = None
    web_pages: Optional[List[str]] = None
    domains: Optional[List[str]] = None

class EnrichedData(BaseModel):
    estimated_tuition_min: Optional[int] = None
    estimated_tuition_max: Optional[int] = None
    acceptance_rate: Optional[str] = None  # "Low", "Medium", "High"
    match_score: Optional[int] = None  # 0-100
    match_type: Optional[str] = None  # "Dream", "Target", "Safe"
    risk_level: Optional[str] = None  # "Low", "Medium", "High"
    why_fits: Optional[str] = None
    risks: Optional[str] = None

class UniversityResponse(UniversityBase):
    enriched_data: Optional[EnrichedData] = None

class ShortlistCreate(BaseModel):
    university_name: str
    country: str
    alpha_two_code: Optional[str] = None
    web_pages: Optional[List[str]] = None
    domains: Optional[List[str]] = None
    enriched_data: Optional[dict] = None

class ShortlistResponse(BaseModel):
    id: UUID
    university_name: str
    country: str
    alpha_two_code: Optional[str] = None
    web_pages: Optional[List[str]] = None
    enriched_data: Optional[dict] = None
    status: str
    locked_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[str] = "MEDIUM"
    university_id: Optional[UUID] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    deadline: Optional[datetime] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: str
    is_completed: bool
    completed_at: Optional[datetime] = None
    university_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# AI Schemas
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    actions_taken: Optional[List[dict]] = None

class ProfileAnalysis(BaseModel):
    academics: str  # "Strong", "Average", "Weak"
    academics_detail: str
    exams: str  # "Not started", "In progress", "Completed"
    exams_detail: str
    sop: str  # "Not started", "Draft", "Ready"
    sop_detail: str
    overall_readiness: int  # 0-100
    next_steps: List[str]
