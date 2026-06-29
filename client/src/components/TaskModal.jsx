import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, onSave, taskToEdit, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    due_date: '',
    category_id: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'Pending',
        priority: taskToEdit.priority || 'Medium',
        due_date: taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '',
        category_id: taskToEdit.category_id || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        due_date: new Date().toISOString().split('T')[0],
        category_id: ''
      });
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (formData.title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return;
    }
    const payload = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id, 10) : null
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Complete Azure Deployment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" 
              rows="3"
              placeholder="Add task details, notes, or subtasks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select 
                className="form-control" 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select 
                className="form-control" 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select 
                className="form-control" 
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">No Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
