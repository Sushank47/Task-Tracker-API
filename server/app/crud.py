from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from typing import List, Optional
from app import models, schemas
from app.utils import DatabaseErrorException, HTTPException
from app.auth import get_password_hash

# --- USER CRUD ---
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_pwd = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CATEGORY CRUD ---
def get_categories(db: Session, user_id: Optional[int] = None) -> List[models.Category]:
    query = db.query(models.Category)
    if user_id:
        query = query.filter((models.Category.user_id == user_id) | (models.Category.user_id == None))
    return query.all()

def create_category(db: Session, category: schemas.CategoryCreate, user_id: Optional[int] = None) -> models.Category:
    db_category = models.Category(
        name=category.name,
        color_code=category.color_code,
        user_id=user_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# --- LOGGING HELPER ---
def log_activity(db: Session, task_id: int, action: str):
    log = models.ActivityLog(task_id=task_id, action=action)
    db.add(log)
    db.commit()

# --- TASK CRUD ---
def get_tasks(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[models.Task]:
    try:
        query = db.query(models.Task)
        if user_id:
            query = query.filter(models.Task.user_id == user_id)
        return query.order_by(models.Task.created_at.desc()).offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        raise DatabaseErrorException(detail=str(e))

def get_task(db: Session, task_id: int, user_id: Optional[int] = None) -> Optional[models.Task]:
    try:
        query = db.query(models.Task).filter(models.Task.id == task_id)
        if user_id:
            query = query.filter(models.Task.user_id == user_id)
        return query.first()
    except SQLAlchemyError as e:
        raise DatabaseErrorException(detail=str(e))

def create_task(db: Session, task: schemas.TaskCreate, user_id: Optional[int] = None) -> models.Task:
    try:
        db_task = models.Task(
            title=task.title,
            description=task.description,
            status=task.status.value if hasattr(task.status, 'value') else task.status,
            priority=task.priority.value if hasattr(task.priority, 'value') else task.priority,
            due_date=task.due_date,
            category_id=task.category_id,
            user_id=user_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        log_activity(db, db_task.id, "Task Created")
        return db_task
    except SQLAlchemyError as e:
        db.rollback()
        raise DatabaseErrorException(detail=str(e))

def update_task(db: Session, db_task: models.Task, task_update: schemas.TaskUpdate) -> models.Task:
    try:
        update_data = task_update.model_dump(exclude_unset=True) if hasattr(task_update, 'model_dump') else task_update.dict(exclude_unset=True)
        changes = []
        for key, value in update_data.items():
            if value is not None:
                if hasattr(value, 'value'):
                    value = value.value
                old_val = getattr(db_task, key)
                if old_val != value:
                    changes.append(f"{key.capitalize()} updated from {old_val} to {value}")
                setattr(db_task, key, value)
        db_task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_task)
        if changes:
            log_activity(db, db_task.id, ", ".join(changes))
        return db_task
    except SQLAlchemyError as e:
        db.rollback()
        raise DatabaseErrorException(detail=str(e))

def delete_task(db: Session, db_task: models.Task) -> None:
    try:
        db.delete(db_task)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise DatabaseErrorException(detail=str(e))

# --- SUBTASK CRUD ---
def create_subtask(db: Session, task_id: int, subtask: schemas.SubtaskCreate) -> models.Subtask:
    db_subtask = models.Subtask(
        task_id=task_id,
        title=subtask.title
    )
    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    log_activity(db, task_id, f"Added subtask: {subtask.title}")
    return db_subtask

def update_subtask(db: Session, subtask_id: int, subtask_update: schemas.SubtaskUpdate) -> models.Subtask:
    db_subtask = db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()
    if not db_subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    if subtask_update.title is not None:
        db_subtask.title = subtask_update.title
    if subtask_update.is_completed is not None:
        db_subtask.is_completed = subtask_update.is_completed
        status_str = "Completed" if subtask_update.is_completed else "Marked incomplete"
        log_activity(db, db_subtask.task_id, f"Subtask '{db_subtask.title}' {status_str}")
    db.commit()
    db.refresh(db_subtask)
    return db_subtask

def delete_subtask(db: Session, subtask_id: int) -> None:
    db_subtask = db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()
    if db_subtask:
        task_id = db_subtask.task_id
        title = db_subtask.title
        db.delete(db_subtask)
        db.commit()
        log_activity(db, task_id, f"Deleted subtask: {title}")

# --- BULK OPERATIONS ---
def bulk_delete_tasks(db: Session, task_ids: List[int], user_id: Optional[int] = None) -> int:
    query = db.query(models.Task).filter(models.Task.id.in_(task_ids))
    if user_id:
        query = query.filter(models.Task.user_id == user_id)
    count = query.delete(synchronize_session=False)
    db.commit()
    return count

def bulk_update_status(db: Session, task_ids: List[int], status: str, user_id: Optional[int] = None) -> int:
    query = db.query(models.Task).filter(models.Task.id.in_(task_ids))
    if user_id:
        query = query.filter(models.Task.user_id == user_id)
    count = query.update({models.Task.status: status, models.Task.updated_at: datetime.utcnow()}, synchronize_session=False)
    db.commit()
    return count
