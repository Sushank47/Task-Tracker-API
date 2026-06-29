import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TaskFilter } from './components/TaskFilter';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { fetchTasks, createTask, updateTask, deleteTask, fetchCategories, logoutUser, bulkDeleteTasks, bulkUpdateStatus } from './api';
import { CheckSquare, AlertCircle } from 'lucide-react';

export function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Filter, Sort & Bulk Selection states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_desc');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      const [tasksData, categoriesData] = await Promise.all([
        fetchTasks().catch(() => []),
        fetchCategories().catch(() => [])
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
      setIsConnected(true);
      setErrorMessage('');
    } catch (err) {
      setIsConnected(false);
      setErrorMessage('Could not connect to FastAPI server (http://127.0.0.1:8000). Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadInitialData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    loadInitialData();
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, formData);
      } else {
        await createTask(formData);
      }
      setIsModalOpen(false);
      setTaskToEdit(null);
      await loadInitialData();
    } catch (err) {
      alert(`Error saving task: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        setSelectedTaskIds(prev => prev.filter(taskId => taskId !== id));
        await loadInitialData();
      } catch (err) {
        alert(`Error deleting task: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      await loadInitialData();
    } catch (err) {
      alert(`Error updating task status: ${err.message}`);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || (task.category_id && task.category_id.toString() === categoryFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'created_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === 'created_asc') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    if (sortBy === 'priority') {
      const pMap = { High: 3, Medium: 2, Low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    return 0;
  });

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) {
      try {
        await bulkDeleteTasks(selectedTaskIds);
        setSelectedTaskIds([]);
        await loadInitialData();
      } catch (err) {
        alert(`Bulk delete failed: ${err.message}`);
      }
    }
  };

  const handleBulkComplete = async () => {
    try {
      await bulkUpdateStatus(selectedTaskIds, 'Completed');
      setSelectedTaskIds([]);
      await loadInitialData();
    } catch (err) {
      alert(`Bulk status update failed: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Protected Gateway: Unauthenticated Users see Landing Page */}
      {!currentUser ? (
        <>
          <LandingPage onOpenAuth={handleOpenAuth} />
          <AuthModal 
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={(user) => { setCurrentUser(user); loadInitialData(); }}
            initialMode={authMode}
          />
        </>
      ) : (
        /* Authenticated Users unlock full Task Workspace */
        <>
          <Header 
            onOpenModal={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            onOpenAuth={handleOpenAuth}
            currentUser={currentUser}
            onLogout={handleLogout}
            isConnected={isConnected}
          />

          {errorMessage && (
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <DashboardStats tasks={tasks} />

          <TaskFilter 
            search={search} setSearch={setSearch}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            categories={categories}
            sortBy={sortBy} setSortBy={setSortBy}
            selectedCount={selectedTaskIds.length}
            onBulkDelete={handleBulkDelete}
            onBulkComplete={handleBulkComplete}
            onSelectAll={handleSelectAll}
            isAllSelected={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
          />

          {loading && tasks.length === 0 ? (
            <div className="empty-state">
              <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state glass-panel">
              <CheckSquare className="empty-icon" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No tasks found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'Try adjusting your filters or search criteria.' 
                  : 'You currently have no tasks created. Click below to add your first task!'}
              </p>
              <button className="btn btn-primary" onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}>
                Create First Task
              </button>
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={(t) => { setTaskToEdit(t); setIsModalOpen(true); }}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggleSelect={handleToggleSelect}
                  onRefresh={loadInitialData}
                />
              ))}
            </div>
          )}

          <TaskModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateOrUpdate}
            taskToEdit={taskToEdit}
            categories={categories}
          />

          <AuthModal 
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={(user) => { setCurrentUser(user); loadInitialData(); }}
            initialMode={authMode}
          />
        </>
      )}
    </div>
  );
}

export default App;
