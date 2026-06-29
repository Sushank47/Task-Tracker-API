import React, { useState } from 'react';
import { Calendar, Edit2, Trash2, CheckSquare, Square, Plus, Tag } from 'lucide-react';
import { createSubtask, updateSubtask, deleteSubtask } from '../api';

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange, isSelected, onToggleSelect, onRefresh }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  const formatStatusClass = (status) => status.replace(' ', '_');

  const getNextStatus = (current) => {
    if (current === 'Pending') return 'In Progress';
    if (current === 'In Progress') return 'Completed';
    return 'Pending';
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.is_completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const handleToggleSubtask = async (subtaskId, currentCompleted) => {
    try {
      await updateSubtask(subtaskId, !currentCompleted);
      onRefresh();
    } catch (err) {
      alert(`Error updating subtask: ${err.message}`);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      await createSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowSubtaskInput(false);
      onRefresh();
    } catch (err) {
      alert(`Error adding subtask: ${err.message}`);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await deleteSubtask(subtaskId);
      onRefresh();
    } catch (err) {
      alert(`Error deleting subtask: ${err.message}`);
    }
  };

  return (
    <div className={`task-card glass-panel priority-${task.priority}`} style={{ borderColor: isSelected ? 'var(--accent-primary)' : undefined, boxShadow: isSelected ? '0 0 15px var(--accent-glow)' : undefined }}>
      <div>
        <div className="task-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={() => onToggleSelect(task.id)}
              style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
            <h3 className="task-title" style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', opacity: task.status === 'Completed' ? 0.7 : 1 }}>
              {task.title}
            </h3>
          </div>
          <div className="task-badges">
            <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
          </div>
        </div>

        {task.category && (
          <div style={{ marginBottom: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: `${task.category.color_code}22`, color: task.category.color_code, border: `1px solid ${task.category.color_code}44` }}>
            <Tag size={12} />
            <span>{task.category.name}</span>
          </div>
        )}

        <p className="task-description">{task.description || 'No detailed description provided.'}</p>

        {/* Subtasks Progress Bar */}
        {subtasks.length > 0 && (
          <div style={{ margin: '1rem 0 0.75rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>
              <span>Subtasks Checklist</span>
              <span>{completedSubtasks}/{subtasks.length} ({progressPercent}%)</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: progressPercent === 100 ? '#34d399' : 'linear-gradient(90deg, #6366f1, #0ea5e9)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Subtask Items List */}
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {subtasks.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '0.825rem', color: s.is_completed ? 'var(--text-muted)' : 'var(--text-primary)', padding: '3px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flex: 1 }} onClick={() => handleToggleSubtask(s.id, s.is_completed)}>
                {s.is_completed ? <CheckSquare size={14} color="#34d399" /> : <Square size={14} color="var(--text-muted)" />}
                <span style={{ textDecoration: s.is_completed ? 'line-through' : 'none' }}>{s.title}</span>
              </div>
              <button className="icon-btn delete" style={{ padding: '2px' }} onClick={() => handleDeleteSubtask(s.id)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {showSubtaskInput ? (
            <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <input 
                type="text" 
                className="form-control" 
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                placeholder="Subtask name..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Add</button>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setShowSubtaskInput(false)}>Cancel</button>
            </form>
          ) : (
            <button 
              onClick={() => setShowSubtaskInput(true)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 0', marginTop: '4px', fontWeight: 500 }}
            >
              <Plus size={12} /> Add subtask
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="task-footer" style={{ marginTop: '1.25rem' }}>
          <div className="task-date">
            <Calendar size={14} />
            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className={`badge badge-status-${formatStatusClass(task.status)}`}
              onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
              title="Click to advance status"
              style={{ cursor: 'pointer', border: '1px solid currentColor' }}
            >
              {task.status}
            </button>

            <div className="task-actions">
              <button className="icon-btn" onClick={() => onEdit(task)} title="Edit Task">
                <Edit2 size={16} />
              </button>
              <button className="icon-btn delete" onClick={() => onDelete(task.id)} title="Delete Task">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
