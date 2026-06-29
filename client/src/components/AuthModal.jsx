import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser, loginWithGoogle } from '../api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "539643779297-3l5e7qjs4acf8qifn7bjt6mjou8ncji4.apps.googleusercontent.com";

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 340,
          text: isLogin ? 'signin_with' : 'signup_with',
        });
      } catch (err) {
        console.warn("Google SDK Init warning:", err);
      }
    }
  }, [isOpen, isLogin]);

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      let gEmail = "google_user@gmail.com";
      let gName = "Google User";
      
      if (response.credential) {
        try {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const payload = JSON.parse(jsonPayload);
          if (payload.email) gEmail = payload.email;
          if (payload.name) gName = payload.name;
        } catch (e) {}
      }

      const data = await loginWithGoogle({
        token: response.credential,
        email: gEmail,
        full_name: gName
      });
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);
        onAuthSuccess(data.user);
      } else {
        await registerUser({ email, password, full_name: fullName });
        const data = await loginUser(email, password);
        onAuthSuccess(data.user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFallback = () => {
    handleGoogleCredentialResponse({ credential: null });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {isLogin ? 'Sign In to Task Tracker' : 'Create Account'}
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Official Google Identity Button Mount */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
          <div ref={googleBtnRef} style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}>
            {/* Fallback button if SDK script loading */}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleGoogleFallback}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0.65rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
          <span style={{ padding: '0 10px' }}>OR EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: '2.4rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? 'Register' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  );
};
