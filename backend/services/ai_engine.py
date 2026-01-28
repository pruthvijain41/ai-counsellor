import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime

from groq import Groq
from config import get_settings
from schemas import ChatResponse, ProfileAnalysis, ChatMessage
from models import Profile, Shortlist, Task

from services.university_service import UniversityService

settings = get_settings()

class AIEngine:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.client = None
        self.model = "llama-3.3-70b-versatile"
        self.university_service = UniversityService()
        
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Groq client: {e}")
    
    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        conversation_history: List[ChatMessage],
        db,
        current_user
    ) -> ChatResponse:
        """Process a message and potentially take actions"""
        print(f"DEBUG: Processing message: '{message}'")
        
        # Always extract potential generic actions from user message
        actions = self._extract_actions("", message, context)
        print(f"DEBUG: Initial extracted actions: {actions}")
        
        # Check for generic shortlist request if no specific shortlist actions found
        # BUT skip if user is trying to clear/delete logic
        message_lower = message.lower()
        is_clear_intent = any(k in message_lower for k in ["clear", "delete", "remove", "empty"])
        
        has_shortlist_action = any(a['type'] == 'shortlist' for a in actions)
        if not has_shortlist_action and not is_clear_intent and ("shortlist" in message_lower or "recommend" in message_lower or "find files" in message_lower or "find colleges" in message_lower or "find universities" in message_lower):
            print("DEBUG: Triggering auto-shortlist")
            auto_actions = await self._auto_shortlist(context)
            actions.extend(auto_actions)
            print(f"DEBUG: Actions after auto-shortlist: {actions}")
        
        if not self.client:
            print("DEBUG: Client not initialized, using fallback")
            return await self._fallback_response(message, context, actions, db, current_user)
        
        try:
            # Build system context
            system_prompt = self._build_system_prompt(context)
            
            # Build messages for Groq
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add conversation history
            for msg in conversation_history[-10:]:
                messages.append({
                    "role": "user" if msg.role == "user" else "assistant",
                    "content": msg.content
                })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            response_text = response.choices[0].message.content
            print(f"DEBUG: AI Response: {response_text[:100]}...")
            
            # Parse response for additional actions from AI
            ai_actions = self._extract_actions(response_text, message, context)
            print(f"DEBUG: AI extracted actions: {ai_actions}")
            
            # Combine user-triggered actions with AI-triggered actions (avoiding duplicates)
            all_actions = actions.copy()
            for a in ai_actions:
                # Simple duplicate check based on type and primary identifier
                is_duplicate = False
                for existing in all_actions:
                    if existing['type'] == a['type']:
                        if a['type'] == 'shortlist' and existing.get('university_name') == a.get('university_name'):
                            is_duplicate = True
                        elif a['type'] == 'lock' and existing.get('university_name') == a.get('university_name'):
                            is_duplicate = True
                
                if not is_duplicate:
                    all_actions.append(a)
            
            # SAFEGUARD: If clearing shortlist, remove any add-shortlist actions that might have slipped in from AI
            if any(a['type'] == 'clear_shortlist' for a in all_actions):
                print("DEBUG: Clear shortlist detected, removing any add-shortlist actions")
                all_actions = [a for a in all_actions if a['type'] != 'shortlist']
            
            print(f"DEBUG: All actions to execute: {all_actions}")
            
            # Execute actions if any
            actions_taken = []
            if all_actions:
                actions_taken = await self._execute_actions(all_actions, db, current_user, context)
                print(f"DEBUG: Actions taken result: {actions_taken}")
                
                # Append action confirmation to response if not already present
                if actions_taken:
                    action_messages = [a.get("message", "") for a in actions_taken if a.get("success")]
                    if action_messages:
                         # Check if response already has action confirmation to avoid double text
                        if "Actions Taken" not in response_text:
                            response_text += "\n\n**Actions Taken:**\n" + "\n".join(f"✅ {m}" for m in action_messages)
            
            return ChatResponse(
                response=response_text,
                actions_taken=actions_taken
            )
            
        except Exception as e:
            print(f"AI processing error: {e}")
            return await self._fallback_response(message, context, actions, db, current_user)
            
    async def _auto_shortlist(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Automatically find universities to shortlist based on profile"""
        actions = []
        profile_data = context.get("profile", {})
        preferred_countries = profile_data.get("preferred_countries", [])
        
        # Default to United States if no preference
        target_country = preferred_countries[0] if preferred_countries else "United States"
        
        # Fetch universities
        # We need a Profile object for search_and_enrich, but we only have dict. 
        # However, search_and_enrich handles None profile by mocking or we can reconstruct a dummy one if needed.
        # UniversityService.search_and_enrich expects a Profile object for AI enrichment, 
        # but for auto-shortlisting generic top lists, we can just fetch.
        # Actually search_and_enrich calls fetch_universities then _enrich_with_ai (which needs profile) or _mock_enrichment.
        # _mock_enrichment handles Optional[Profile].
        
        # Let's try to get results
        try:
            results = await self.university_service.search_and_enrich(target_country, None)
            
            # Pick top 3 universities that are not already shortlisted
            shortlisted_names = {s['name'].lower() for s in context.get("shortlisted_universities", [])}
            
            count = 0
            for uni in results:
                if uni['name'].lower() not in shortlisted_names and count < 3:
                    actions.append({
                        "type": "shortlist",
                        "university_name": uni['name'],
                        "country": uni['country']
                    })
                    count += 1
        except Exception as e:
            print(f"Auto-shortlist error: {e}")
            
        return actions
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build the system prompt with user context"""
        profile = context.get("profile", {})
        shortlists = context.get("shortlisted_universities", [])
        tasks = context.get("pending_tasks", [])
        
        locked_unis = [s for s in shortlists if s.get("status") == "LOCKED"]
        shortlisted_unis = [s for s in shortlists if s.get("status") == "SHORTLISTED"]
        
        # Build list of preferred countries for recommendations
        preferred_countries = profile.get('preferred_countries', [])
        country_for_recs = preferred_countries[0] if preferred_countries else "United States"
        
        return f"""You are an AI Study Abroad Counsellor with the ability to take REAL ACTIONS in the system.

CRITICAL: When users ask you to DO something (shortlist, lock, add, apply, etc.), you MUST take action by including the appropriate action tags. Do NOT just give advice - ACTUALLY DO IT.

STUDENT PROFILE:
- Name: {context.get('user_name', 'Student')}
- Education: {profile.get('degree')} in {profile.get('major')}
- GPA: {profile.get('gpa') or 'Not specified'}
- Target: {profile.get('intended_degree')} in {profile.get('field_of_study')}
- Target Intake: {profile.get('target_intake')}
- Preferred Countries: {', '.join(preferred_countries) if preferred_countries else 'Not specified'}
- Budget: ${profile.get('budget_min', 0):,} - ${profile.get('budget_max', 0):,} per year
- Funding: {profile.get('funding_type')}
- IELTS: {profile.get('ielts_status')} (Score: {profile.get('ielts_score') or 'N/A'})
- GRE: {profile.get('gre_status')} (Score: {profile.get('gre_score') or 'N/A'})
- SOP Status: {profile.get('sop_status')}

SHORTLISTED UNIVERSITIES ({len(shortlisted_unis)}):
{json.dumps([s['name'] + ' - ' + s['country'] for s in shortlisted_unis], indent=2) if shortlisted_unis else "None yet"}

LOCKED UNIVERSITIES ({len(locked_unis)}):
{json.dumps([s['name'] + ' - ' + s['country'] for s in locked_unis], indent=2) if locked_unis else "None locked yet"}

PENDING TASKS ({len(tasks)}):
{json.dumps([t['title'] for t in tasks[:5]], indent=2) if tasks else "No tasks yet"}

=== YOUR ACTION CAPABILITIES ===

YOU CAN TAKE REAL ACTIONS. Use these tags in your response and the system will execute them:

1. **SHORTLIST**: [ACTION:SHORTLIST:University Name:Country]
   - Example: [ACTION:SHORTLIST:Stanford University:United States]
   - Use this when user says: "shortlist", "add to list", "recommend some", "find universities", "suggest colleges"
   
2. **LOCK**: [ACTION:LOCK:University Name]
   - Example: [ACTION:LOCK:Stanford University]
   - Use this when user says: "lock", "apply", "commit to", "finalize"
   - Note: University must be in shortlist first

3. **CREATE TASK**: [ACTION:TASK:Task Title:PRIORITY]
   - Example: [ACTION:TASK:Complete SOP draft:HIGH]
   - Priority: HIGH, MEDIUM, or LOW
   - Use this when user says: "add task", "remind me", "create task", "add to tracker"

=== WHEN TO USE ACTIONS ===

SHORTLIST TRIGGERS (USE ACTION TAGS):
- "shortlist some colleges" → Recommend 3-5 universities that fit their profile AND include [ACTION:SHORTLIST:...] for each
- "add universities" → Suggest and add specific universities
- "recommend schools" → Give recommendations AND shortlist them
- "find colleges for me" → Search and shortlist matching universities

LOCK TRIGGERS (USE ACTION TAGS):
- "lock [university name]" → Find it in shortlist and lock it
- "apply to [university name]" → Lock it for application
- "lock all" → Lock all shortlisted universities
- "start application" → Lock a university

EXAMPLE RESPONSES:

User: "Shortlist some universities for me"
Your response: "Based on your profile (GPA: {profile.get('gpa')}, Budget: ${profile.get('budget_max'):,}/year, Target: {profile.get('field_of_study')}), here are recommended universities:

🎯 **Target Schools:**
1. University of Toronto - Great {profile.get('field_of_study')} program, fits your budget
[ACTION:SHORTLIST:University of Toronto:Canada]

2. Arizona State University - Strong research, good funding options  
[ACTION:SHORTLIST:Arizona State University:United States]

✅ **Safe Schools:**
3. University of British Columbia - High acceptance for your profile
[ACTION:SHORTLIST:University of British Columbia:Canada]"

User: "Lock Toronto for application"
Your response: "Locking University of Toronto for your application! ✅
[ACTION:LOCK:University of Toronto]

This will generate application tasks in your Tracker."

=== RESPONSE GUIDELINES ===
- Be concise but helpful
- When recommending, categorize as: 🌟 DREAM (reach), 🎯 TARGET (good fit), ✅ SAFE (likely accept)
- ALWAYS use action tags when user requests actions
- After taking actions, briefly explain what you did"""
    
    def _extract_actions(self, response: str, message: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract actions from the AI response and user message"""
        actions = []
        message_lower = message.lower()
        response_lower = response.lower()
        shortlists = context.get("shortlisted_universities", [])
        
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
            
        # [ACTION:UNLOCK:university_name]
        unlock_pattern = r'\[ACTION:UNLOCK:([^\]]+)\]'
        unlock_matches = re.findall(unlock_pattern, response, re.IGNORECASE)
        for uni_name in unlock_matches:
            actions.append({
                "type": "unlock",
                "university_name": uni_name.strip()
            })
        
        # Also detect explicit user requests
        if "lock" in message_lower or "apply" in message_lower:
            # Check for "lock all" or generic lock requests (no specific university mentioned)
            generic_lock_phrases = ["lock all", "lock and apply", "lock everything", "apply to all", 
                                   "lock colleges", "lock universities", "apply to colleges", 
                                   "lock shortlist", "apply shortlist", "lock my shortlist"]
            
            is_generic_lock = any(phrase in message_lower for phrase in generic_lock_phrases)
            
            if is_generic_lock:
                # Lock ALL shortlisted universities
                for uni in shortlists:
                    uni_status = str(uni.get("status", "")).upper()
                    if uni_status == "SHORTLISTED":
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
                        uni_status = str(uni.get("status", "")).upper()
                        if uni_status == "SHORTLISTED":
                            actions.append({
                                "type": "lock",
                                "university_id": uni.get("id"),
                                "university_name": uni.get("name")
                            })
                            break
        
        # Detect task creation requests
        if "add task" in message_lower or "create task" in message_lower or "remind me" in message_lower:
            actions.append({
                "type": "task_intent",
                "message": message
            })
            
        # Detect CLEAR SHORTLIST requests
        clear_keywords = ["clear shortlist", "delete shortlist", "remove all shortlisted", "delete all shortlisted", "empty shortlist", "clear my shortlist"]
        if any(keyword in message_lower for keyword in clear_keywords):
            actions.append({
                "type": "clear_shortlist"
            })
            
        # Detect UNLOCK requests
        if "unlock" in message_lower:
            generic_unlock_phrases = ["unlock all", "unlock everything", "unlock applied", "unlock colleges", "unlock universities"]
            is_generic_unlock = any(phrase in message_lower for phrase in generic_unlock_phrases)
            
            if is_generic_unlock:
                # Unlock ALL locked universities
                for uni in shortlists:
                    uni_status = str(uni.get("status", "")).upper()
                    if uni_status == "LOCKED":
                        actions.append({
                            "type": "unlock",
                            "university_id": uni.get("id"),
                            "university_name": uni.get("name")
                        })
            else:
                # Specific unlock
                for uni in shortlists:
                    uni_name_lower = uni.get("name", "").lower()
                    if uni_name_lower in message_lower or any(word in message_lower for word in uni_name_lower.split() if len(word) > 3):
                        uni_status = str(uni.get("status", "")).upper()
                        if uni_status == "LOCKED":
                            actions.append({
                                "type": "unlock",
                                "university_id": uni.get("id"),
                                "university_name": uni.get("name")
                            })
                            break
        
        return actions
    
    async def _execute_actions(
        self,
        actions: List[Dict[str, Any]],
        db,
        current_user,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Execute extracted actions in the database"""
        results = []
        shortlists = context.get("shortlisted_universities", [])
        
        for action in actions:
            action_type = action.get("type")
            
            if action_type == "shortlist":
                # Add university to shortlist
                uni_name = action.get("university_name", "").strip()
                country = action.get("country", "").strip()
                
                if uni_name:
                    try:
                        # Check if already shortlisted
                        existing = db.query(Shortlist).filter(
                            Shortlist.user_id == current_user.id,
                            Shortlist.university_name.ilike(f"%{uni_name}%")
                        ).first()
                        
                        if existing:
                            results.append({
                                "action": "shortlist",
                                "success": False,
                                "message": f"{uni_name} is already in your shortlist"
                            })
                        else:
                            # Create new shortlist entry
                            new_shortlist = Shortlist(
                                user_id=current_user.id,
                                university_name=uni_name,
                                country=country or "Unknown",
                                alpha_two_code="",
                                web_pages=[],
                                status="SHORTLISTED"
                            )
                            db.add(new_shortlist)
                            db.commit()
                            
                            results.append({
                                "action": "shortlist",
                                "success": True,
                                "message": f"Added {uni_name} to your shortlist"
                            })
                    except Exception as e:
                        print(f"Shortlist action error: {e}")
                        results.append({
                            "action": "shortlist",
                            "success": False,
                            "message": str(e)
                        })
            
            elif action_type == "lock":
                # Find the university to lock
                uni_id = action.get("university_id")
                uni_name = action.get("university_name", "").strip()
                
                # First try to find by ID from context
                if not uni_id and uni_name:
                    # Try context shortlists first
                    for s in shortlists:
                        if s.get("status") == "SHORTLISTED" and uni_name.lower() in s.get("name", "").lower():
                            uni_id = s.get("id")
                            break
                
                # If not found in context, search database directly by name
                if not uni_id and uni_name:
                    db_shortlist = db.query(Shortlist).filter(
                        Shortlist.user_id == current_user.id,
                        Shortlist.status == "SHORTLISTED",
                        Shortlist.university_name.ilike(f"%{uni_name}%")
                    ).first()
                    if db_shortlist:
                        uni_id = str(db_shortlist.id)
                
                if uni_id:
                    try:
                        shortlist_entry = db.query(Shortlist).filter(
                            Shortlist.id == uni_id,
                            Shortlist.user_id == current_user.id,
                            Shortlist.status == "SHORTLISTED"
                        ).first()
                        
                        if shortlist_entry:
                            shortlist_entry.status = "LOCKED"
                            shortlist_entry.locked_at = datetime.utcnow()
                            
                            # Update profile stage
                            profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
                            if profile:
                                profile.current_stage = "APPLICATION"
                            
                            # Generate default application tasks (Same as in universities router)
                            from datetime import timedelta
                            default_tasks = [
                                {"title": f"Complete Application Form - {shortlist_entry.university_name}", "type": "FORM", "priority": "HIGH"},
                                {"title": f"Write Statement of Purpose - {shortlist_entry.university_name}", "type": "SOP", "priority": "HIGH"},
                                {"title": f"Gather Transcripts & Documents - {shortlist_entry.university_name}", "type": "DOC", "priority": "MEDIUM"},
                                {"title": f"Request Letters of Recommendation - {shortlist_entry.university_name}", "type": "DOC", "priority": "MEDIUM"},
                                {"title": f"Pay Application Fee - {shortlist_entry.university_name}", "type": "FORM", "priority": "HIGH"},
                            ]
                            
                            for task_data in default_tasks:
                                new_task = Task(
                                    user_id=current_user.id,
                                    university_id=shortlist_entry.id,
                                    title=task_data["title"],
                                    type=task_data["type"],
                                    priority=task_data["priority"],
                                    deadline=datetime.utcnow() + timedelta(days=30)
                                )
                                db.add(new_task)

                            db.commit()
                            
                            results.append({
                                "action": "lock",
                                "success": True,
                                "message": f"Locked {shortlist_entry.university_name} for application and generated checklist tasks"
                            })
                        else:
                            results.append({
                                "action": "lock",
                                "success": False,
                                "message": f"'{uni_name}' is not in your shortlist or is already locked. Please add it to shortlist first from the Discovery page."
                            })
                    except Exception as e:
                        print(f"Lock action error: {e}")
                        results.append({
                            "action": "lock",
                            "success": False,
                            "message": str(e)
                        })
                else:
                    results.append({
                        "action": "lock",
                        "success": False,
                        "message": f"Could not find '{uni_name}' in your shortlist. Please add it from the Discovery page first."
                    })
            
            elif action_type == "create_task":
                try:
                    new_task = Task(
                        user_id=current_user.id,
                        title=action.get("title"),
                        priority=action.get("priority", "MEDIUM"),
                        type="GENERAL"
                    )
                    db.add(new_task)
                    db.commit()
                    
                    results.append({
                        "action": "create_task",
                        "success": True,
                        "message": f"Created task: {action.get('title')}"
                    })
                except Exception as e:
                    print(f"Task creation error: {e}")
                    results.append({
                        "action": "create_task",
                        "success": False,
                        "message": str(e)
                    })
            

            
            elif action_type == "unlock":
                uni_id = action.get("university_id")
                uni_name = action.get("university_name", "").strip()
                
                # Try to resolve ID if missing
                if not uni_id and uni_name:
                    db_shortlist = db.query(Shortlist).filter(
                        Shortlist.user_id == current_user.id,
                        Shortlist.status == "LOCKED",
                        Shortlist.university_name.ilike(f"%{uni_name}%")
                    ).first()
                    if db_shortlist:
                        uni_id = str(db_shortlist.id)
                
                if uni_id:
                    try:
                        shortlist_entry = db.query(Shortlist).filter(
                            Shortlist.id == uni_id,
                            Shortlist.user_id == current_user.id
                        ).first()
                        
                        if shortlist_entry:
                            # Delete associated tasks
                            db.query(Task).filter(
                                Task.university_id == uni_id,
                                Task.user_id == current_user.id
                            ).delete()
                            
                            # Unlock 
                            shortlist_entry.status = "SHORTLISTED"
                            shortlist_entry.locked_at = None
                            
                            # Check if any other universities are still locked
                            other_locked = db.query(Shortlist).filter(
                                Shortlist.user_id == current_user.id,
                                Shortlist.status == "LOCKED",
                                Shortlist.id != uni_id
                            ).first()
                            
                            if not other_locked:
                                profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
                                if profile:
                                    profile.current_stage = "SHORTLIST"
                            
                            db.commit()
                            
                            results.append({
                                "action": "unlock",
                                "success": True,
                                "message": f"Unlocked {shortlist_entry.university_name} and removed application tasks"
                            })
                        else:
                            results.append({
                                "action": "unlock",
                                "success": False,
                                "message": f"University not found or not locked"
                            })
                    except Exception as e:
                        print(f"Unlock action error: {e}")
                        results.append({
                            "action": "unlock",
                            "success": False,
                            "message": str(e)
                        })
                else:
                     results.append({
                        "action": "unlock",
                        "success": False,
                        "message": f"Could not find '{uni_name}' in your locked list."
                    })

            elif action_type == "task_intent":
                results.append({
                    "action": "task_hint",
                    "success": True,
                    "message": "To create a task, tell me what you need to do and I'll add it for you. For example: 'Add a task to submit my SOP by next week'"
                })
            
            elif action_type == "clear_shortlist":
                try:
                    # Delete all SHORTLISTED (not LOCKED) universities
                    deleted_count = db.query(Shortlist).filter(
                        Shortlist.user_id == current_user.id,
                        Shortlist.status == "SHORTLISTED"
                    ).delete()
                    
                    # Also delete associated tasks for these universities if any (though usually tasks are for LOCKED ones)
                    # But if we had tasks for shortlisted ones, we might want to keep or delete? 
                    # Generally, tasks are tied to university_id. If university is deleted, tasks might become orphaned or should be deleted.
                    # Since we are deleting the shortlist entry, let's play safe and NOT delete general tasks, 
                    # but if we wanted to be thorough we could checks tasks tied to these IDs.
                    # Given the scope, let's just delete the shortlist entries.
                    
                    db.commit()
                    
                    results.append({
                        "action": "clear_shortlist",
                        "success": True,
                        "message": f"Cleared {deleted_count} universities from your shortlist."
                    })
                except Exception as e:
                    print(f"Clear shortlist error: {e}")
                    results.append({
                        "action": "clear_shortlist",
                        "success": False,
                        "message": str(e)
                    })
        
        return results
    
    async def _fallback_response(self, message: str, context: Dict[str, Any], actions: List[Dict[str, Any]] = None, db = None, current_user = None) -> ChatResponse:
        """Provide a helpful fallback response when AI is unavailable, but still execute actions"""
        profile = context.get("profile", {})
        shortlists = context.get("shortlisted_universities", [])
        
        # Double check for actions if none provided
        if not actions and message:
             actions = self._extract_actions("", message, context)
        
        # Execute any detected actions
        actions_taken = []
        if actions and db and current_user:
            actions_taken = await self._execute_actions(actions, db, current_user, context)
        
        # Generate contextual fallback
        name = context.get("user_name", "").split()[0] if context.get("user_name") else "there"
        
        locked_count = len([s for s in shortlists if s.get("status") == "LOCKED"])
        shortlist_count = len(shortlists)
        
        # Check if we just took actions
        if actions_taken:
            success_messages = [a.get("message", "") for a in actions_taken if a.get("success")]
            failure_messages = [a.get("message", "") for a in actions_taken if not a.get("success")]
            
            response = f"Done! Here's what I did:\n\n"
            if success_messages:
                response += "\n".join(f"✅ {m}" for m in success_messages)
            if failure_messages:
                response += "\n\n⚠️ Some issues:\n" + "\n".join(f"- {m}" for m in failure_messages)
            
            response += "\n\nWhat else can I help you with?"
            return ChatResponse(response=response, actions_taken=actions_taken)
            
        elif shortlist_count == 0:
            response = f"""Hi {name}! I'm your AI Counsellor.

Based on your profile:
- **Target**: {profile.get('intended_degree')} in {profile.get('field_of_study')}
- **Countries**: {', '.join(profile.get('preferred_countries', ['Not specified']))}
- **Budget**: ${profile.get('budget_min', 0):,} - ${profile.get('budget_max', 0):,}/year

**Next Steps:**
1. 🔍 Head to the **Discovery** page to explore universities
2. ➕ Add universities that match your profile to your shortlist
3. 🔒 Lock at least one to start your application journey

What would you like to know about the application process?"""
        elif locked_count == 0:
            uni_names = [s.get("name") for s in shortlists[:3]]
            response = f"""Hi {name}! I see you have {shortlist_count} universities shortlisted:
{chr(10).join('• ' + n for n in uni_names)}

**Profile Highlights:**
- GPA: {profile.get('gpa') or 'Not specified'}
- IELTS: {profile.get('ielts_status')}
- SOP: {profile.get('sop_status')}

**Recommendation:** Lock at least one university to unlock application tasks.

Would you like me to lock one of these for you? Just say "Lock [University Name]" or "Lock all"."""
        else:
            response = f"""Great progress, {name}! You have {locked_count} locked universities.

**Next Steps:**
1. ✅ Generate application tasks in the Tracker
2. 📝 Work on your Statement of Purpose
3. 📄 Gather required documents

How can I help with your applications today?"""
        
        return ChatResponse(response=response, actions_taken=actions_taken)
    
    async def analyze_profile(self, profile: Profile) -> ProfileAnalysis:
        """Analyze profile and return strength assessment"""
        
        # Academic strength
        gpa = float(profile.gpa) if profile.gpa else 0
        if gpa >= 3.5:
            academics = "Strong"
            academics_detail = f"Your GPA of {gpa} is competitive for most programs."
        elif gpa >= 3.0:
            academics = "Average"
            academics_detail = f"Your GPA of {gpa} is acceptable. Consider highlighting projects and experience."
        else:
            academics = "Weak"
            academics_detail = f"Your GPA of {gpa} may limit options. Focus on strong SOP and recommendations."
        
        # Exam status
        ielts_done = profile.ielts_status == "Completed"
        gre_done = profile.gre_status == "Completed" if profile.gre_status else True
        
        if ielts_done and gre_done:
            exams = "Completed"
            exams_detail = "All required exams are complete. Great job!"
        elif ielts_done or gre_done:
            exams = "In progress"
            pending = []
            if not ielts_done:
                pending.append("IELTS")
            if profile.gre_status and not gre_done:
                pending.append("GRE")
            exams_detail = f"Complete these exams: {', '.join(pending)}"
        else:
            exams = "Not started"
            exams_detail = "Start with IELTS/TOEFL first, then consider GRE if required."
        
        # SOP status
        sop = profile.sop_status or "Not started"
        if sop == "Ready":
            sop_detail = "Your SOP is ready. Consider university-specific versions."
        elif sop == "Draft":
            sop_detail = "Review and finalize your SOP before applications."
        else:
            sop_detail = "Start drafting your SOP. This is crucial for applications."
        
        # Overall score
        score = 0
        if gpa >= 3.5:
            score += 35
        elif gpa >= 3.0:
            score += 25
        else:
            score += 15
        
        if ielts_done:
            score += 20
        if gre_done:
            score += 15
        if sop == "Ready":
            score += 20
        elif sop == "Draft":
            score += 10
        
        if profile.preferred_countries:
            score += 10
        
        return ProfileAnalysis(
            overall_score=min(score, 100),
            academics=academics,
            academics_detail=academics_detail,
            exams=exams,
            exams_detail=exams_detail,
            sop=sop,
            sop_detail=sop_detail,
            recommendations=self._get_recommendations(profile, academics, exams, sop)
        )
    
    def _get_recommendations(self, profile: Profile, academics: str, exams: str, sop: str) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if academics == "Weak":
            recommendations.append("Focus on strong letters of recommendation to offset GPA")
        
        if exams != "Completed":
            if profile.ielts_status != "Completed":
                recommendations.append("Book your IELTS exam slot as soon as possible")
            if profile.gre_status and profile.gre_status != "Completed":
                recommendations.append("Prepare for GRE if required by your target programs")
        
        if sop != "Ready":
            recommendations.append("Work on your Statement of Purpose - it's crucial for admissions")
        
        if not profile.preferred_countries:
            recommendations.append("Select your preferred countries to get better recommendations")
        
        if not recommendations:
            recommendations.append("Your profile looks strong! Start shortlisting universities.")
        
        return recommendations
