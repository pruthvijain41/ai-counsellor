import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime

from groq import Groq
from config import get_settings
from schemas import ChatResponse, ProfileAnalysis, ChatMessage
from models import Profile, Shortlist, Task

settings = get_settings()

class AIEngine:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.client = None
        self.model = "llama-3.3-70b-versatile"
        
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
        
        if not self.client:
            return self._fallback_response(message, context)
        
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
            
            # Parse response for actions
            actions = self._extract_actions(response_text, message, context)
            
            # Execute actions if any
            actions_taken = []
            if actions:
                actions_taken = await self._execute_actions(actions, db, current_user, context)
                
                # Append action confirmation to response
                if actions_taken:
                    action_messages = [a.get("message", "") for a in actions_taken if a.get("success")]
                    if action_messages:
                        response_text += "\n\n**Actions Taken:**\n" + "\n".join(f"✅ {m}" for m in action_messages)
            
            return ChatResponse(
                response=response_text,
                actions_taken=actions_taken
            )
            
        except Exception as e:
            print(f"AI processing error: {e}")
            return self._fallback_response(message, context)
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build the system prompt with user context"""
        profile = context.get("profile", {})
        shortlists = context.get("shortlisted_universities", [])
        tasks = context.get("pending_tasks", [])
        
        locked_unis = [s for s in shortlists if s.get("status") == "LOCKED"]
        shortlisted_unis = [s for s in shortlists if s.get("status") == "SHORTLISTED"]
        
        return f"""You are an AI Study Abroad Counsellor with the ability to take REAL ACTIONS in the system.

STUDENT PROFILE:
- Name: {context.get('user_name', 'Student')}
- Education: {profile.get('degree')} in {profile.get('major')}
- GPA: {profile.get('gpa') or 'Not specified'}
- Target: {profile.get('intended_degree')} in {profile.get('field_of_study')}
- Target Intake: {profile.get('target_intake')}
- Preferred Countries: {', '.join(profile.get('preferred_countries', []))}
- Budget: ${profile.get('budget_min', 0):,} - ${profile.get('budget_max', 0):,} per year
- Funding: {profile.get('funding_type')}
- IELTS: {profile.get('ielts_status')} (Score: {profile.get('ielts_score') or 'N/A'})
- GRE: {profile.get('gre_status')} (Score: {profile.get('gre_score') or 'N/A'})
- SOP Status: {profile.get('sop_status')}

SHORTLISTED UNIVERSITIES ({len(shortlisted_unis)}):
{json.dumps([s['name'] + ' - ' + s['country'] for s in shortlisted_unis], indent=2) if shortlisted_unis else "None yet - encourage discovery"}

LOCKED UNIVERSITIES ({len(locked_unis)}):
{json.dumps([s['name'] + ' - ' + s['country'] for s in locked_unis], indent=2) if locked_unis else "None locked yet"}

PENDING TASKS ({len(tasks)}):
{json.dumps([t['title'] for t in tasks[:5]], indent=2) if tasks else "No tasks - generate after locking a university"}

YOUR CAPABILITIES (YOU CAN TAKE THESE ACTIONS):
1. **SHORTLIST a university**: To add a university to the student's shortlist, include [ACTION:SHORTLIST:university_name:country] in your response. Example: [ACTION:SHORTLIST:MIT:United States]

2. **LOCK a university**: If the student asks to lock a university that's already shortlisted, include [ACTION:LOCK:university_name] in your response.

3. **CREATE a task**: To add a task or reminder, include [ACTION:TASK:task_title:priority] in your response. Priority can be HIGH, MEDIUM, or LOW.

3. **RECOMMEND universities**: Categorize as:
   - 🌟 DREAM: Highly competitive, lower acceptance chance
   - 🎯 TARGET: Good fit, reasonable chance
   - ✅ SAFE: Strong chance of acceptance

RESPONSE GUIDELINES:
- Be concise but helpful
- Explain WHY a university fits or doesn't
- Identify profile STRENGTHS (good GPA, completed exams, etc.)
- Identify GAPS (missing exams, low budget, incomplete SOP)
- Always suggest actionable next steps
- Use bullet points for clarity
- When taking actions, be explicit about what you're doing

STAGE-BASED GUIDANCE:
- If no universities shortlisted: Guide to Discovery page
- If shortlisted but not locked: Encourage locking at least one
- If locked: Focus on application tasks and preparation"""
    
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
        
        # Also detect explicit user requests
        if "lock" in message_lower:
            # Try to find which university to lock
            for uni in shortlists:
                uni_name_lower = uni.get("name", "").lower()
                if uni_name_lower in message_lower or any(word in message_lower for word in uni_name_lower.split()[:2]):
                    if uni.get("status") == "SHORTLISTED":
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
                            db.commit()
                            
                            # Update profile stage
                            profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
                            if profile:
                                profile.current_stage = "APPLICATION"
                                db.commit()
                            
                            results.append({
                                "action": "lock",
                                "success": True,
                                "message": f"Locked {shortlist_entry.university_name} for application"
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
            
            elif action_type == "task_intent":
                results.append({
                    "action": "task_hint",
                    "success": True,
                    "message": "To create a task, tell me what you need to do and I'll add it for you. For example: 'Add a task to submit my SOP by next week'"
                })
        
        return results
    
    def _fallback_response(self, message: str, context: Dict[str, Any]) -> ChatResponse:
        """Provide a helpful fallback response when AI is unavailable"""
        profile = context.get("profile", {})
        shortlists = context.get("shortlisted_universities", [])
        
        # Generate contextual fallback
        name = context.get("user_name", "").split()[0] if context.get("user_name") else "there"
        
        locked_count = len([s for s in shortlists if s.get("status") == "LOCKED"])
        shortlist_count = len(shortlists)
        
        if shortlist_count == 0:
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

Would you like me to lock one of these for you? Just say "Lock [University Name]"."""
        else:
            response = f"""Great progress, {name}! You have {locked_count} locked universities.

**Next Steps:**
1. ✅ Generate application tasks in the Tracker
2. 📝 Work on your Statement of Purpose
3. 📄 Gather required documents

How can I help with your applications today?"""
        
        return ChatResponse(response=response, actions_taken=[])
    
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
