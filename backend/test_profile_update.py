import requests
from config import get_settings

BASE_URL = "http://localhost:8000/api"

def test_update():
    # 1. Login to get token
    # Create a test user if not exists or use existing
    email = "test@example.com"
    password = "password123"
    name = "Test User"
    
    try:
        # Try signup
        requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password, "name": name})
    except:
        pass

    # Login
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return

    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Update Profile with new fields
    data = {
        "ielts_type": "TOEFL",
        "toefl_score": 110,
        "education_level": "Bachelors"
    }
    
    print(f"Sending update: {data}")
    resp = requests.put(f"{BASE_URL}/profile", json=data, headers=headers)
    
    if resp.status_code == 200:
        print("Update Success!")
        print(resp.json())
    else:
        print(f"Update Failed: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    test_update()
