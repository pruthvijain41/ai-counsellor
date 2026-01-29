
import asyncio
from services.university_service import UniversityService
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

async def test():
    print("Initializing UniversityService...")
    service = UniversityService()
    
    print("Fetching universities for United States...")
    try:
        results = await service.search_and_enrich("United States", None)
        print(f"Found {len(results)} universities")
        for i, uni in enumerate(results[:3]):
            print(f"{i+1}. {uni.get('name')} - {uni.get('country')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
