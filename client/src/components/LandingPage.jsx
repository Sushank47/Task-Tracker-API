import React, { useState } from 'react';
import { CheckSquare, ArrowRight, Shield, Zap, Layers, BarChart3, BookOpen, User, Lock, ExternalLink, X, CheckCircle2 } from 'lucide-react';

export const LandingPage = ({ onOpenAuth, onOpenDocs }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="landing-container">
      {/* Top Header Navbar */}
      <header className="app-header glass-panel" style={{ marginBottom: '3rem' }}>
        <div className="brand-section">
          <div className="brand-icon">
            <CheckSquare size={24} />
          </div>
          <div>
            <h1 className="brand-title">Task Tracker API</h1>
            <p className="brand-subtitle">Enterprise Backend & Workflow Management</p>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="#home" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Home</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Features</a>
          <button 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setIsGuideOpen(true)}
          >
            <BookOpen size={16} /> User Guide
          </button>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ExternalLink size={14} /> API Docs
          </a>
          
          <div style={{ display: 'flex', gap: '10px', marginLeft: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => onOpenAuth('login')}>
              <User size={16} /> Sign In
            </button>
            <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" style={{ textAlignment: 'center', padding: '3rem 1rem', textAlign: 'center', maxWidth: '850px', margin: '0 auto 4rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Zap size={14} /> Next-Generation Task Workspace
        </div>
        
        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Organize daily tasks with speed, security & high performance.
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Developed with FastAPI, PostgreSQL, and SQLAlchemy. Features JWT authentication, subtask checklists, dynamic category tagging, and automated activity logs.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} onClick={() => onOpenAuth('register')}>
            <span>Access Platform Workspace</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }} onClick={() => setIsGuideOpen(true)}>
            <BookOpen size={18} />
            <span>Read Platform Guide</span>
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '2.5rem' }}>Core System Features</h2>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', marginBottom: '1.25rem' }}>
              <Shield size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>JWT Auth & Roles</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Secure bcrypt password hashing and JSON Web Tokens safeguard user workspaces and database isolation.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <Layers size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Subtask Checklists</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Break down complex tasks into subtasks with automatic visual percentage progress calculation.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: '1.25rem' }}>
              <Zap size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bulk Operations</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Perform instant batch actions including multi-select bulk completion and bulk deletion.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Guide Modal */}
      {isGuideOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={22} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Task Tracker Application Guide</h2>
              </div>
              <button className="icon-btn" onClick={() => setIsGuideOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ lineHeight: 1.6, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
              <h3 style={{ color: 'var(--accent-primary)', marginTop: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>1. Access Control & Sign-In</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                To unlock the platform workspace, click <strong>Sign In</strong> or <strong>Get Started</strong>. You can sign in with standard email credentials or use <strong>Google OAuth</strong>.
              </p>

              <h3 style={{ color: 'var(--accent-primary)', marginTop: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>2. Task Lifecycle & Priorities</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Tasks support three status stages (<code>Pending</code>, <code>In Progress</code>, <code>Completed</code>) and priority levels (<code>Low</code>, <code>Medium</code>, <code>High</code>). Click on any status badge on a card to cycle to the next state.
              </p>

              <h3 style={{ color: 'var(--accent-primary)', marginTop: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>3. Interactive Subtasks Checklist</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Each task card allows inline subtask creation. Check off subtasks directly to update the visual progress bar in real time.
              </p>

              <h3 style={{ color: 'var(--accent-primary)', marginTop: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>4. Bulk Actions & Filters</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Use the top toolbar to search or filter by status, priority, and category tags. Select checkboxes on task cards to trigger the Bulk Actions bar for batch operations.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <button className="btn btn-primary" onClick={() => { setIsGuideOpen(false); onOpenAuth('login'); }}>
                Proceed to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
