import os
from sqlalchemy import create_engine, text
from config import get_settings

try:
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        print("Connecting to database...")
        
        # Check if columns exist
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'"))
        columns = [row[0] for row in result]
        
        if 'ielts_type' not in columns:
            print("Adding ielts_type column...")
            conn.execute(text("ALTER TABLE profiles ADD COLUMN ielts_type VARCHAR(20) DEFAULT 'IELTS'"))
        else:
            print("ielts_type already exists.")
            
        if 'gre_type' not in columns:
            print("Adding gre_type column...")
            conn.execute(text("ALTER TABLE profiles ADD COLUMN gre_type VARCHAR(20) DEFAULT 'GRE'"))
        else:
            print("gre_type already exists.")
            
        conn.commit()
        print("Migration complete!")
        
except Exception as e:
    print(f"Error: {e}")
