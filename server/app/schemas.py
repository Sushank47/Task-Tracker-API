from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class StatusEnum(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class PriorityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

# User Schemas
class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Category Schemas
class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=50)
    color_code: str = Field(default="#6366f1", max_length=20)

class CategoryResponse(BaseModel):
    id: int
    name: str
    color_code: str

    class Config:
        from_attributes = True

# Subtask Schemas
class SubtaskCreate(BaseModel):
    title: str = Field(..., max_length=150)

class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    is_completed: Optional[bool] = None

class SubtaskResponse(BaseModel):
    id: int
    task_id: int
    title: str
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Activity Log Schema
class ActivityLogResponse(BaseModel):
    id: int
    action: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str = Field(..., max_length=100, description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed description")
    status: StatusEnum = Field(default=StatusEnum.PENDING)
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    due_date: Optional[date] = Field(None)
    category_id: Optional[int] = Field(None)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[PriorityEnum] = None
    due_date: Optional[date] = None
    category_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    subtasks: List[SubtaskResponse] = []

    class Config:
        from_attributes = True

class BulkDeleteRequest(BaseModel):
    task_ids: List[int]

class BulkStatusRequest(BaseModel):
    task_ids: List[int]
    status: StatusEnum

class MessageResponse(BaseModel):
    message: str
