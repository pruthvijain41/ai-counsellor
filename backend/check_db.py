
from database import SessionLocal
from models import User, Shortlist

db = SessionLocal()

def check():
    users = db.query(User).all()
    print(f"Found {len(users)} users")
    
    for user in users:
        print(f"\nUser: {user.name} ({user.id})")
        shortlists = db.query(Shortlist).filter(Shortlist.user_id == user.id).all()
        print(f"  Shortlists: {len(shortlists)}")
        for s in shortlists:
            print(f"    - {s.university_name} [{s.status}]")

if __name__ == "__main__":
    check()
