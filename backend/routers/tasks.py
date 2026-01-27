from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import User, Profile, Task, Shortlist
from schemas import TaskCreate, TaskUpdate, TaskResponse
from routers.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    university_id: Optional[str] = None,
    completed: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for the current user"""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if university_id:
        query = query.filter(Task.university_id == university_id)
    
    if completed is not None:
        query = query.filter(Task.is_completed == completed)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    return tasks

@router.post("", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        type=task_data.type,
        deadline=task_data.deadline,
        priority=task_data.priority or "MEDIUM",
        university_id=task_data.university_id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )
    
    update_data = task_data.model_dump(exclude_unset=True)
    
    # Handle completion
    if "is_completed" in update_data:
        if update_data["is_completed"] and not task.is_completed:
            task.completed_at = datetime.utcnow()
        elif not update_data["is_completed"]:
            task.completed_at = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    return task

@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a task as completed"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )
    
    if task.is_completed:
        raise HTTPException(
            status_code=400,
            detail="Task is already completed"
        )
    
    task.is_completed = True
    task.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@router.post("/generate")
async def generate_tasks(
    university_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate default tasks based on profile and locked universities"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )
    
    # Get locked universities
    locked_universities = db.query(Shortlist).filter(
        Shortlist.user_id == current_user.id,
        Shortlist.status == "LOCKED"
    ).all()
    
    if not locked_universities:
        raise HTTPException(
            status_code=400,
            detail="Please lock at least one university before generating tasks"
        )
    
    tasks_to_create = []
    
    # Common tasks for all applications
    common_tasks = [
        {"title": "Complete Statement of Purpose (SOP)", "type": "SOP", "priority": "HIGH"},
        {"title": "Gather academic transcripts", "type": "DOC", "priority": "HIGH"},
        {"title": "Get recommendation letters", "type": "DOC", "priority": "HIGH"},
        {"title": "Update resume/CV", "type": "DOC", "priority": "MEDIUM"},
    ]
    
    # Check exam status and add tasks
    if profile.ielts_status != "Completed":
        common_tasks.append({
            "title": "Complete IELTS exam",
            "type": "EXAM",
            "priority": "HIGH"
        })
    
    if profile.gre_status and profile.gre_status != "Completed":
        common_tasks.append({
            "title": "Complete GRE exam",
            "type": "EXAM",
            "priority": "MEDIUM"
        })
    
    # Create common tasks
    for task_info in common_tasks:
        # Check if task already exists
        existing = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.title == task_info["title"]
        ).first()
        
        if not existing:
            task = Task(
                user_id=current_user.id,
                title=task_info["title"],
                type=task_info["type"],
                priority=task_info["priority"]
            )
            db.add(task)
            tasks_to_create.append(task_info["title"])
    
    # University-specific tasks
    for uni in locked_universities:
        uni_tasks = [
            {"title": f"Complete application form for {uni.university_name}", "type": "FORM"},
            {"title": f"Pay application fee for {uni.university_name}", "type": "FINANCE"},
            {"title": f"Write university-specific essay for {uni.university_name}", "type": "SOP"},
        ]
        
        for task_info in uni_tasks:
            existing = db.query(Task).filter(
                Task.user_id == current_user.id,
                Task.title == task_info["title"]
            ).first()
            
            if not existing:
                task = Task(
                    user_id=current_user.id,
                    university_id=uni.id,
                    title=task_info["title"],
                    type=task_info["type"],
                    priority="MEDIUM"
                )
                db.add(task)
                tasks_to_create.append(task_info["title"])
    
    db.commit()
    
    return {
        "message": f"Generated {len(tasks_to_create)} new tasks",
        "tasks_created": tasks_to_create
    }
