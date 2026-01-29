import os
from sqlalchemy import create_engine, text
from config import get_settings

try:
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        print("Connecting to database...")
        result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles'"))
        print("\nColumns in 'profiles' table:")
        for row in result:
            print(f"- {row[0]} ({row[1]})")
            
except Exception as e:
    print(f"Error: {e}")
