from typing import List, Optional
from datetime import datetime, timezone
from app import schemas
from app.utils import DatabaseErrorException, HTTPException
from app.auth import get_password_hash

async def get_next_sequence(db, seq_name: str) -> int:
    res = await db.counters.find_one_and_update(
        {"_id": seq_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return res["seq"]

# --- USER CRUD ---
async def get_user_by_email(db, email: str) -> Optional[dict]:
    return await db.users.find_one({"email": email})

async def create_user(db, user: schemas.UserCreate) -> dict:
    user_id = await get_next_sequence(db, "user_id")
    hashed_pwd = get_password_hash(user.password)
    user_doc = {
        "id": user_id,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_pwd,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)
    return user_doc

# --- CATEGORY CRUD ---
async def get_categories(db, user_id: Optional[int] = None) -> List[dict]:
    query = {}
    if user_id:
        query = {"$or": [{"user_id": user_id}, {"user_id": None}]}
    cursor = db.categories.find(query)
    return await cursor.to_list(length=100)

async def create_category(db, category: schemas.CategoryCreate, user_id: Optional[int] = None) -> dict:
    cat_id = await get_next_sequence(db, "category_id")
    cat_doc = {
        "id": cat_id,
        "name": category.name,
        "color_code": category.color_code,
        "user_id": user_id
    }
    await db.categories.insert_one(cat_doc)
    return cat_doc

# --- LOGGING HELPER ---
async def log_activity(db, task_id: int, action: str):
    log_id = await get_next_sequence(db, "log_id")
    log_doc = {
        "id": log_id,
        "task_id": task_id,
        "action": action,
        "timestamp": datetime.now(timezone.utc)
    }
    await db.activity_logs.insert_one(log_doc)

# --- TASK CRUD ---
async def get_tasks(db, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[dict]:
    query = {}
    if user_id:
        query["user_id"] = user_id
    cursor = db.tasks.find(query).sort("created_at", -1).skip(skip).limit(limit)
    tasks = await cursor.to_list(length=limit)

    for t in tasks:
        if t.get("category_id"):
            t["category"] = await db.categories.find_one({"id": t["category_id"]})
        else:
            t["category"] = None
        sub_cursor = db.subtasks.find({"task_id": t["id"]})
        t["subtasks"] = await sub_cursor.to_list(length=50)
    return tasks

async def get_task(db, task_id: int, user_id: Optional[int] = None) -> Optional[dict]:
    query = {"id": task_id}
    if user_id:
        query["user_id"] = user_id
    t = await db.tasks.find_one(query)
    if t:
        if t.get("category_id"):
            t["category"] = await db.categories.find_one({"id": t["category_id"]})
        else:
            t["category"] = None
        sub_cursor = db.subtasks.find({"task_id": t["id"]})
        t["subtasks"] = await sub_cursor.to_list(length=50)
    return t

async def create_task(db, task: schemas.TaskCreate, user_id: Optional[int] = None) -> dict:
    task_id = await get_next_sequence(db, "task_id")
    now = datetime.now(timezone.utc)
    due = datetime.combine(task.due_date, datetime.min.time(), tzinfo=timezone.utc) if task.due_date else None

    task_doc = {
        "id": task_id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value if hasattr(task.status, 'value') else task.status,
        "priority": task.priority.value if hasattr(task.priority, 'value') else task.priority,
        "due_date": due,
        "category_id": task.category_id,
        "user_id": user_id,
        "created_at": now,
        "updated_at": now
    }
    await db.tasks.insert_one(task_doc)
    await log_activity(db, task_id, "Task Created")
    return await get_task(db, task_id, user_id)

async def update_task(db, task_id: int, task_update: schemas.TaskUpdate, user_id: Optional[int] = None) -> Optional[dict]:
    db_task = await db.tasks.find_one({"id": task_id})
    if not db_task:
        return None

    update_data = task_update.model_dump(exclude_unset=True) if hasattr(task_update, 'model_dump') else task_update.dict(exclude_unset=True)
    if not update_data:
        return await get_task(db, task_id, user_id)

    formatted_update = {}
    changes = []
    for k, v in update_data.items():
        if v is not None:
            if hasattr(v, 'value'):
                v = v.value
            if k == 'due_date' and isinstance(v, datetime) == False and hasattr(v, 'year'):
                v = datetime.combine(v, datetime.min.time(), tzinfo=timezone.utc)
            old_val = db_task.get(k)
            if old_val != v:
                changes.append(f"{k.capitalize()} updated")
            formatted_update[k] = v

    formatted_update["updated_at"] = datetime.now(timezone.utc)
    await db.tasks.update_one({"id": task_id}, {"$set": formatted_update})
    if changes:
        await log_activity(db, task_id, ", ".join(changes))
    return await get_task(db, task_id, user_id)

async def delete_task(db, task_id: int, user_id: Optional[int] = None) -> bool:
    res = await db.tasks.delete_one({"id": task_id})
    if res.deleted_count > 0:
        await db.subtasks.delete_many({"task_id": task_id})
        await db.activity_logs.delete_many({"task_id": task_id})
        return True
    return False

# --- SUBTASK CRUD ---
async def create_subtask(db, task_id: int, subtask: schemas.SubtaskCreate) -> dict:
    sub_id = await get_next_sequence(db, "subtask_id")
    sub_doc = {
        "id": sub_id,
        "task_id": task_id,
        "title": subtask.title,
        "is_completed": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.subtasks.insert_one(sub_doc)
    await log_activity(db, task_id, f"Added subtask: {subtask.title}")
    return sub_doc

async def update_subtask(db, subtask_id: int, subtask_update: schemas.SubtaskUpdate) -> Optional[dict]:
    sub = await db.subtasks.find_one({"id": subtask_id})
    if not sub:
        return None
    upd = {}
    if subtask_update.title is not None:
        upd["title"] = subtask_update.title
    if subtask_update.is_completed is not None:
        upd["is_completed"] = subtask_update.is_completed
        status_str = "Completed" if subtask_update.is_completed else "Marked incomplete"
        await log_activity(db, sub["task_id"], f"Subtask '{sub['title']}' {status_str}")
    await db.subtasks.update_one({"id": subtask_id}, {"$set": upd})
    return await db.subtasks.find_one({"id": subtask_id})

async def delete_subtask(db, subtask_id: int):
    sub = await db.subtasks.find_one({"id": subtask_id})
    if sub:
        await db.subtasks.delete_one({"id": subtask_id})
        await log_activity(db, sub["task_id"], f"Deleted subtask: {sub['title']}")

# --- BULK OPERATIONS ---
async def bulk_delete_tasks(db, task_ids: List[int], user_id: Optional[int] = None) -> int:
    query = {"id": {"$in": task_ids}}
    if user_id:
        query["user_id"] = user_id
    res = await db.tasks.delete_many(query)
    await db.subtasks.delete_many({"task_id": {"$in": task_ids}})
    await db.activity_logs.delete_many({"task_id": {"$in": task_ids}})
    return res.deleted_count

async def bulk_update_status(db, task_ids: List[int], status: str, user_id: Optional[int] = None) -> int:
    query = {"id": {"$in": task_ids}}
    if user_id:
        query["user_id"] = user_id
    res = await db.tasks.update_many(query, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}})
    return res.modified_count
