from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, ARRAY, Numeric, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shortlists = relationship("Shortlist", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    # Academic Background
    education_level = Column(String(50))  # High School, Bachelor's, Master's
    degree = Column(String(100))
    major = Column(String(100))
    graduation_year = Column(Integer)
    gpa = Column(Numeric(3, 2))
    
    # Study Goals
    intended_degree = Column(String(50))  # Bachelor's, Master's, MBA, PhD
    field_of_study = Column(String(100))
    target_intake = Column(String(20))  # Fall 2025, Spring 2026
    preferred_countries = Column(ARRAY(String))
    
    # Budget
    budget_min = Column(Integer)
    budget_max = Column(Integer)
    funding_type = Column(String(50))  # Self-funded, Scholarship, Loan
    
    # Exam Readiness
    # Exam Readiness
    ielts_status = Column(String(50))  # Not started, Scheduled, Completed
    ielts_type = Column(String(20), default="IELTS") # IELTS, TOEFL
    ielts_score = Column(Numeric(3, 1)) # Changed to (3,1) to allow 10.0 or slightly larger if needed, though IELTS is max 9.0
    toefl_status = Column(String(50))
    toefl_score = Column(Integer)
    gre_status = Column(String(50))
    gre_type = Column(String(20), default="GRE") # GRE, GMAT
    gre_score = Column(Integer)
    gmat_status = Column(String(50))
    gmat_score = Column(Integer)
    sop_status = Column(String(50))  # Not started, Draft, Ready
    
    # Stage Tracking
    onboarding_completed = Column(Boolean, default=False)
    has_seen_tour = Column(Boolean, default=False)
    current_stage = Column(String(50), default="PROFILE")  # PROFILE, DISCOVERY, SHORTLIST, LOCKED, APPLICATION
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")


class Shortlist(Base):
    __tablename__ = "shortlists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    university_name = Column(String(255), nullable=False)
    country = Column(String(100))
    alpha_two_code = Column(String(10))
    web_pages = Column(ARRAY(String))
    domains = Column(ARRAY(String))
    
    # AI-enriched data stored as JSON
    enriched_data = Column(JSON)  # Contains: estimated_tuition, acceptance_rate, match_score, risk_level, match_type
    
    status = Column(String(50), default="SHORTLISTED")  # SHORTLISTED, LOCKED
    locked_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="shortlists")
    tasks = relationship("Task", back_populates="university", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    university_id = Column(UUID(as_uuid=True), ForeignKey("shortlists.id", ondelete="CASCADE"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50))  # DOC, EXAM, FORM, SOP, VISA, FINANCE
    deadline = Column(DateTime(timezone=True))
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH
    
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    university = relationship("Shortlist", back_populates="tasks")
