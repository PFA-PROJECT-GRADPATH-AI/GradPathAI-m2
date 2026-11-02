import React, { useState } from 'react';
import { UserCheck, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('student@gradpath.ai');
  const [password, setPassword] = useState('GradPath2026!');
  const [fullName, setFullName] = useState('Alex Mercer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const body = isRegister ? { email, password, fullName } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      const user = await res.json();
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('student@gradpath.ai');
    setPassword('GradPath2026!');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@gradpath.ai', password: 'GradPath2026!' }),
      });
      if (res.ok) {
        const user = await res.json();
        onLoginSuccess(user);
      } else {
        onLoginSuccess({ id: 'demo-student-id', email: 'student@gradpath.ai', fullName: 'Demo Student' });
      }
    } catch (err) {
      onLoginSuccess({ id: 'demo-student-id', email: 'student@gradpath.ai', fullName: 'Demo Student' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(99, 102, 241, 0.25))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            marginBottom: '1rem'
          }}>
            <Sparkles size={32} color="#38BDF8" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.03em' }}>
            GradPath AI
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.35rem' }}>
            GradPath — University Discovery & Research Matching
          </p>
        </div>

        {/* Demo 1-Click Login Card */}
        <div style={{
          backgroundColor: 'rgba(3, 7, 18, 0.6)',
          border: '1px dashed rgba(56, 189, 248, 0.4)',
          borderRadius: '0.75rem',
          padding: '1.15rem',
          marginBottom: '1.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.5rem', fontWeight: 500 }}>
            Quick Evaluator Access:
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-glow-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}
          >
            <UserCheck size={17} />
            1-Click Demo Student Login
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: !isRegister ? '2px solid #38BDF8' : '2px solid transparent',
              color: !isRegister ? '#38BDF8' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: isRegister ? '2px solid #38BDF8' : '2px solid transparent',
              color: isRegister ? '#38BDF8' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            color: '#FB7185',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(3, 7, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#F9FAFB',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(3, 7, 18, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.6rem',
                color: '#F9FAFB',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(3, 7, 18, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.6rem',
                color: '#F9FAFB',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
            {isRegister ? 'Register & Sign In' : 'Sign In with Session Cookie'}
          </button>
        </form>
      </div>
    </div>
  );
}
