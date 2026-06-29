from fastapi import APIRouter, Depends, status
from typing import List, Optional
from app import schemas, crud_mongo, auth
from app.database import get_mongo
from app.utils import TaskNotFoundException, InvalidTaskIdException

router = APIRouter(tags=["Tasks"])

# --- CATEGORY ENDPOINTS ---
@router.get("/categories", response_model=List[schemas.CategoryResponse], tags=["Categories"])
async def get_categories(mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    user_id = current_user.id if current_user else None
    return await crud_mongo.get_categories(mongo_db, user_id=user_id)

@router.post("/categories", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED, tags=["Categories"])
async def create_category(category: schemas.CategoryCreate, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    user_id = current_user.id if current_user else None
    return await crud_mongo.create_category(mongo_db, category=category, user_id=user_id)

# --- TASK ENDPOINTS ---
@router.post("/tasks", response_model=schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_new_task(task: schemas.TaskCreate, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    user_id = current_user.id if current_user else None
    await crud_mongo.create_task(mongo_db, task=task, user_id=user_id)
    return {"message": "Task Created Successfully"}

@router.get("/tasks", response_model=List[schemas.TaskResponse])
async def read_all_tasks(skip: int = 0, limit: int = 100, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    user_id = current_user.id if current_user else None
    tasks = await crud_mongo.get_tasks(mongo_db, user_id=user_id, skip=skip, limit=limit)
    return tasks

@router.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
async def read_task_by_id(task_id: int, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    if task_id <= 0:
        raise InvalidTaskIdException()
    user_id = current_user.id if current_user else None
    db_task = await crud_mongo.get_task(mongo_db, task_id=task_id, user_id=user_id)
    if db_task is None:
        raise TaskNotFoundException()
    return db_task

@router.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
async def update_existing_task(task_id: int, task_update: schemas.TaskUpdate, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    if task_id <= 0:
        raise InvalidTaskIdException()
    user_id = current_user.id if current_user else None
    db_task = await crud_mongo.get_task(mongo_db, task_id=task_id, user_id=user_id)
    if db_task is None:
        raise TaskNotFoundException()
    updated_task = await crud_mongo.update_task(mongo_db, task_id=task_id, task_update=task_update, user_id=user_id)
    return updated_task

@router.delete("/tasks/{task_id}", response_model=schemas.MessageResponse)
async def delete_existing_task(task_id: int, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    if task_id <= 0:
        raise InvalidTaskIdException()
    user_id = current_user.id if current_user else None
    db_task = await crud_mongo.get_task(mongo_db, task_id=task_id, user_id=user_id)
    if db_task is None:
        raise TaskNotFoundException()
    await crud_mongo.delete_task(mongo_db, task_id=task_id, user_id=user_id)
    return {"message": "Task Deleted Successfully"}

# --- SUBTASK ENDPOINTS ---
@router.post("/tasks/{task_id}/subtasks", response_model=schemas.SubtaskResponse, status_code=status.HTTP_201_CREATED, tags=["Subtasks"])
async def create_subtask(task_id: int, subtask: schemas.SubtaskCreate, mongo_db = Depends(get_mongo)):
    db_task = await crud_mongo.get_task(mongo_db, task_id=task_id)
    if not db_task:
        raise TaskNotFoundException()
    return await crud_mongo.create_subtask(mongo_db, task_id=task_id, subtask=subtask)

@router.put("/subtasks/{subtask_id}", response_model=schemas.SubtaskResponse, tags=["Subtasks"])
async def update_subtask(subtask_id: int, subtask_update: schemas.SubtaskUpdate, mongo_db = Depends(get_mongo)):
    sub = await crud_mongo.update_subtask(mongo_db, subtask_id=subtask_id, subtask_update=subtask_update)
    if not sub:
        raise TaskNotFoundException()
    return sub

@router.delete("/subtasks/{subtask_id}", response_model=schemas.MessageResponse, tags=["Subtasks"])
async def delete_subtask(subtask_id: int, mongo_db = Depends(get_mongo)):
    await crud_mongo.delete_subtask(mongo_db, subtask_id=subtask_id)
    return {"message": "Subtask Deleted Successfully"}

# --- BULK & ACTIVITY LOG ENDPOINTS ---
@router.post("/tasks/bulk-delete", response_model=schemas.MessageResponse, tags=["Bulk Operations"])
async def bulk_delete_tasks(req: schemas.BulkDeleteRequest, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    user_id = current_user.id if current_user else None
    count = await crud_mongo.bulk_delete_tasks(mongo_db, task_ids=req.task_ids, user_id=user_id)
    return {"message": f"Successfully deleted {count} tasks"}

@router.post("/tasks/bulk-status", response_model=schemas.MessageResponse, tags=["Bulk Operations"])
async def bulk_update_status(req: schemas.BulkStatusRequest, mongo_db = Depends(get_mongo), current_user = Depends(auth.get_current_user_optional)):
    user_id = current_user.id if current_user else None
    count = await crud_mongo.bulk_update_status(mongo_db, task_ids=req.task_ids, status=req.status.value, user_id=user_id)
    return {"message": f"Successfully updated status for {count} tasks"}

@router.get("/tasks/{task_id}/activity-logs", response_model=List[schemas.ActivityLogResponse], tags=["Activity Logs"])
async def get_activity_logs(task_id: int, mongo_db = Depends(get_mongo)):
    db_task = await crud_mongo.get_task(mongo_db, task_id=task_id)
    if not db_task:
        raise TaskNotFoundException()
    cursor = mongo_db.activity_logs.find({"task_id": task_id}).sort("timestamp", -1)
    return await cursor.to_list(length=100)
