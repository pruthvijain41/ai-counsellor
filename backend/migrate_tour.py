from sqlalchemy import create_engine, text
from config import get_settings

def add_column():
    settings = get_settings()
    engine = create_engine(settings.database_url)
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_tour BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Column 'has_seen_tour' added successfully!")
    except Exception as e:
        print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_column()
