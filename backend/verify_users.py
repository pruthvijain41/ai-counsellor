from database import SessionLocal
from models import User
import sys

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users found: {len(users)}")
        for user in users:
            print(f"User: {user.email}, Name: {user.name}, ID: {user.id}")
            
        if len(users) == 0:
            print("No users found in the 'users' table.")
            print("If you signed up but don't see users here, the signup request might have failed.")
        else:
            print("\nIf you see your user here, it means the account was created successfully.")
            print("NOTE: These users are stored in the 'public.users' table, NOT in Supabase Auth.")
            print("Go to Supabase Dashboard -> Table Editor -> 'users' table to see them.")
            
    except Exception as e:
        print(f"Error connecting to database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
