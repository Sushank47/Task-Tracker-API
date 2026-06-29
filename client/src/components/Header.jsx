import React from 'react';
import { CheckSquare, Plus, Server, User, LogOut } from 'lucide-react';

export const Header = ({ onOpenModal, onOpenAuth, currentUser, onLogout, isConnected }) => {
  return (
    <header className="app-header glass-panel">
      <div className="brand-section">
        <div className="brand-icon">
          <CheckSquare size={24} />
        </div>
        <div>
          <h1 className="brand-title">Task Tracker API</h1>
          <p className="brand-subtitle">FastAPI & PostgreSQL Task Operations</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="api-badge" style={{ background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isConnected ? '#34d399' : '#f87171', borderColor: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
          <div className="pulse-dot" style={{ backgroundColor: isConnected ? '#34d399' : '#f87171', boxShadow: isConnected ? '0 0 8px #34d399' : '0 0 8px #f87171' }} />
          <Server size={14} />
          <span>{isConnected ? 'FastAPI Connected' : 'Connecting...'}</span>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} />
              <span>{currentUser.full_name}</span>
            </div>
            <button className="icon-btn delete" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={onOpenAuth}>
            <User size={16} />
            <span>Sign In</span>
          </button>
        )}

        <button className="btn btn-primary" onClick={onOpenModal}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
