
import asyncio
from typing import Dict, Any, List
import re

# Mock AIEngine class with just _extract_actions
class MockAIEngine:
    def _extract_actions(self, response: str, message: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract actions from the AI response and user message"""
        print(f"DEBUG: Extracting actions for message: '{message}'")
        actions = []
        message_lower = message.lower()
        response_lower = response.lower()
        shortlists = context.get("shortlisted_universities", [])
        
        print(f"DEBUG: Context has {len(shortlists)} universities")
        for s in shortlists:
            print(f"  - {s.get('name')} ({s.get('status')})")
        
        # Check for action tags in response
        # [ACTION:SHORTLIST:university_name:country]
        shortlist_pattern = r'\[ACTION:SHORTLIST:([^:]+):([^\]]+)\]'
        shortlist_matches = re.findall(shortlist_pattern, response, re.IGNORECASE)
        for uni_name, country in shortlist_matches:
            actions.append({
                "type": "shortlist",
                "university_name": uni_name.strip(),
                "country": country.strip()
            })
        
        # [ACTION:LOCK:university_name]
        lock_pattern = r'\[ACTION:LOCK:([^\]]+)\]'
        lock_matches = re.findall(lock_pattern, response, re.IGNORECASE)
        for uni_name in lock_matches:
            actions.append({
                "type": "lock",
                "university_name": uni_name.strip()
            })
        
        # [ACTION:TASK:title:priority]
        task_pattern = r'\[ACTION:TASK:([^:]+):([^\]]+)\]'
        task_matches = re.findall(task_pattern, response, re.IGNORECASE)
        for title, priority in task_matches:
            actions.append({
                "type": "create_task",
                "title": title.strip(),
                "priority": priority.strip().upper()
            })
        
        # Also detect explicit user requests
        if "lock" in message_lower or "apply" in message_lower:
            # Check for "lock all" or generic lock requests (no specific university mentioned)
            generic_lock_phrases = ["lock all", "lock and apply", "lock everything", "apply to all", 
                                   "lock colleges", "lock universities", "apply to colleges", 
                                   "lock shortlist", "apply shortlist", "lock my shortlist"]
            
            is_generic_lock = any(phrase in message_lower for phrase in generic_lock_phrases)
            print(f"DEBUG: is_generic_lock = {is_generic_lock}")
            
            if is_generic_lock:
                # Lock ALL shortlisted universities
                for uni in shortlists:
                    if uni.get("status") == "SHORTLISTED":
                        print(f"DEBUG: Adding generic lock for {uni.get('name')}")
                        actions.append({
                            "type": "lock",
                            "university_id": uni.get("id"),
                            "university_name": uni.get("name")
                        })
            else:
                # Try to find which specific university to lock
                for uni in shortlists:
                    uni_name_lower = uni.get("name", "").lower()
                    uni_words = uni_name_lower.split()[:3]  # First 3 words of university name
                    if uni_name_lower in message_lower or any(word in message_lower for word in uni_words if len(word) > 3):
                        if uni.get("status") == "SHORTLISTED":
                            print(f"DEBUG: Adding specific lock for {uni.get('name')}")
                            actions.append({
                                "type": "lock",
                                "university_id": uni.get("id"),
                                "university_name": uni.get("name")
                            })
                            break
        
        return actions

async def test():
    engine = MockAIEngine()
    
    # Mock context
    context = {
        "shortlisted_universities": [
            {"id": "1", "name": "Harvard University", "status": "SHORTLISTED"},
            {"id": "2", "name": "Stanford University", "status": "SHORTLISTED"},
            {"id": "3", "name": "MIT", "status": "LOCKED"}
        ]
    }
    
    # Test cases
    messages = [
        "lock all",
        "lock and apply colleges in shortlist",
        "lock Harvard",
        "apply to colleges"
    ]
    
    for msg in messages:
        print(f"\n--- Testing: '{msg}' ---")
        actions = engine._extract_actions("", msg, context)
        print(f"Actions found: {len(actions)}")
        for a in actions:
            print(f"  - {a}")

if __name__ == "__main__":
    asyncio.run(test())
