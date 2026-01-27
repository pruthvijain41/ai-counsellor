"""
Database initialization script
Creates all tables in the database
"""

from sqlalchemy import create_engine
from config import get_settings
from models import Base

def init_db():
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
