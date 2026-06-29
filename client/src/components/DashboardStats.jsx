import React from 'react';
import { ListTodo, Clock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export const DashboardStats = ({ tasks }) => {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

  return (
    <div className="stats-grid">
      <div className="stat-card glass-panel">
        <div className="stat-info">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
          <ListTodo size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-info">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-info">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgress}</div>
        </div>
        <div className="stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
          <Loader2 size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-info">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completed}</div>
        </div>
        <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          <CheckCircle2 size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-info">
          <div className="stat-label">High Priority Active</div>
          <div className="stat-value">{highPriority}</div>
        </div>
        <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
          <AlertTriangle size={24} />
        </div>
      </div>
    </div>
  );
};
