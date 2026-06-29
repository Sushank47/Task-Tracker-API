const getPrimaryUrl = () => {
  const host = window.location.hostname || 'localhost';
  return `http://${host}:8000`;
};

const getFallbackUrl = () => {
  const host = window.location.hostname === '127.0.0.1' ? 'localhost' : '127.0.0.1';
  return `http://${host}:8000`;
};

let activeBaseUrl = getPrimaryUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const requestWithFallback = async (endpoint, options = {}) => {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  const reqOptions = { ...options, headers };

  try {
    const res = await fetch(`${activeBaseUrl}${endpoint}`, reqOptions);
    return res;
  } catch (err) {
    const alternateUrl = getFallbackUrl();
    try {
      const res2 = await fetch(`${alternateUrl}${endpoint}`, reqOptions);
      activeBaseUrl = alternateUrl;
      return res2;
    } catch (err2) {
      throw new Error('Could not connect to backend server. Please ensure FastAPI server is running.');
    }
  }
};

// --- AUTH SERVICES ---
export const loginUser = async (email, password) => {
  const res = await requestWithFallback('/auth/login/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Incorrect email or password');
  }
  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const registerUser = async (userData) => {
  const res = await requestWithFallback('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed. Email may already exist.');
  }
  return await res.json();
};

export const loginWithGoogle = async (gData) => {
  const res = await requestWithFallback('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Google authentication failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// --- CATEGORY SERVICES ---
export const fetchCategories = async () => {
  const res = await requestWithFallback('/categories');
  if (!res.ok) return [];
  return await res.json();
};

export const createCategory = async (categoryData) => {
  const res = await requestWithFallback('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return await res.json();
};

// --- TASK SERVICES ---
export const fetchTasks = async () => {
  const response = await requestWithFallback('/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks from server');
  }
  return await response.json();
};

export const fetchTaskById = async (id) => {
  const response = await requestWithFallback(`/tasks/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Task not found');
  }
  return await response.json();
};

export const createTask = async (taskData) => {
  const response = await requestWithFallback('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create task');
  }
  return await response.json();
};

export const updateTask = async (id, taskData) => {
  const response = await requestWithFallback(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update task');
  }
  return await response.json();
};

export const deleteTask = async (id) => {
  const response = await requestWithFallback(`/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete task');
  }
  return await response.json();
};

// --- SUBTASK SERVICES ---
export const createSubtask = async (taskId, title) => {
  const res = await requestWithFallback(`/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create subtask');
  return await res.json();
};

export const updateSubtask = async (subtaskId, isCompleted) => {
  const res = await requestWithFallback(`/subtasks/${subtaskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_completed: isCompleted })
  });
  if (!res.ok) throw new Error('Failed to update subtask');
  return await res.json();
};

export const deleteSubtask = async (subtaskId) => {
  const res = await requestWithFallback(`/subtasks/${subtaskId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete subtask');
  return await res.json();
};

// --- BULK OPERATIONS ---
export const bulkDeleteTasks = async (taskIds) => {
  const res = await requestWithFallback('/tasks/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_ids: taskIds })
  });
  if (!res.ok) throw new Error('Bulk delete failed');
  return await res.json();
};

export const bulkUpdateStatus = async (taskIds, status) => {
  const res = await requestWithFallback('/tasks/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_ids: taskIds, status })
  });
  if (!res.ok) throw new Error('Bulk status update failed');
  return await res.json();
};
