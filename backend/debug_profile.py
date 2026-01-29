import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Profile, User
from config import get_settings

# Setup DB
settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Inspect profiles
profiles = db.query(Profile).all()
print(f"Found {len(profiles)} profiles.")

for p in profiles:
    print(f"User ID: {p.user_id}")
    print(f"  GPA: {p.gpa} ({type(p.gpa)})")
    print(f"  IELTS Type: {p.ielts_type} | Score: {p.ielts_score} | Status: {p.ielts_status}")
    print(f"  TOEFL Status: {p.toefl_status} | Score: {p.toefl_score}")
    print(f"  GRE Type: {p.gre_type} | Score: {p.gre_score} | Status: {p.gre_status}")
    print(f"  Onboarding Completed: {p.onboarding_completed}")
    print("-" * 20)
