import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, CheckCircle2, Layers, BookOpen, ChevronRight, Zap, Database } from 'lucide-react';
import AuthPage from './pages/AuthPage';
import DiscoveryMatchPage from './pages/DiscoveryMatchPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('match');
  const [approvedLeads, setApprovedLeads] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.warn('User not signed in or API offline', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) { /* silent */ }
    setUser(null);
  };

  const loadApprovedLeads = async () => {
    try {
      const res = await fetch('/api/v1/leads/approved');
      if (res.ok) {
        const data = await res.json();
        setApprovedLeads(data);
      }
    } catch (err) {
      console.error('Failed to load approved leads', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'leads') loadApprovedLeads();
  }, [activeTab]);

  if (loadingUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(56, 189, 248, 0.2)',
          borderTop: '3px solid #38BDF8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Initializing GradPath AI…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={(u) => setUser(u)} />;
  }

  const tabs = [
    { id: 'match', label: 'Research Match', icon: <Layers size={16} /> },
    { id: 'leads', label: 'Approved Leads', icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <header style={{
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 2rem',
        height: '62px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)',
              padding: '0.45rem',
              borderRadius: '0.6rem',
              display: 'flex',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.03em' }}>
                GradPath AI
              </span>
              <span style={{
                fontSize: '0.68rem',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}>
                GRADPATH
              </span>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: activeTab === tab.id ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                  background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: activeTab === tab.id ? '#38BDF8' : '#94A3B8'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284C7, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#FFFFFF'
            }}>
              {(user.fullName || user.email)?.[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F9FAFB', lineHeight: 1.2 }}>
                {user.fullName || 'Student'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1 }}>
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-glass-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            title="Sign Out"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1 }}>
        {activeTab === 'match' && <DiscoveryMatchPage user={user} />}

        {activeTab === 'leads' && (
          <div style={{ maxWidth: '1000px', margin: '2.5rem auto', padding: '0 2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.03em' }}>
                  Approved Leads
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                  ApprovedLead v1 contracts persisted via EF Core with RFC 9562 UUIDv7 identifiers
                </p>
              </div>
              <button onClick={loadApprovedLeads} className="btn-glass-secondary" style={{ fontSize: '0.82rem' }}>
                Refresh
              </button>
            </div>

            {approvedLeads.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1.25rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <Database size={28} color="#334155" />
                </div>
                <h3 style={{ color: '#E2E8F0', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No Leads Approved Yet
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Head to the AI Matching Engine, find your top-ranked professor, and click&nbsp;
                  <strong style={{ color: '#38BDF8' }}>Approve Lead (Export v1)</strong>.
                </p>
                <button onClick={() => setActiveTab('match')} className="btn-glow-primary" style={{ margin: '0 auto', display: 'inline-flex' }}>
                  <Zap size={16} />
                  Open AI Match Engine
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {approvedLeads.map((lead, idx) => (
                  <div
                    key={lead.id}
                    className="glass-panel-glow"
                    style={{ padding: '1.35rem 1.5rem', borderLeft: '4px solid #10B981' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>LEAD #{idx + 1}</span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                          {lead.professorName}
                        </h3>
                        <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                          {lead.universityName} — {lead.programName}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="badge-neon-green">● {lead.status}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
                          {lead.fitScore}%
                        </span>
                      </div>
                    </div>

                    {/* UUIDv7 Contract ID */}
                    <div style={{
                      backgroundColor: 'rgba(3, 7, 18, 0.7)',
                      borderRadius: '0.5rem',
                      padding: '0.55rem 0.85rem',
                      marginBottom: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, whiteSpace: 'nowrap' }}>UUIDv7 CONTRACT:</span>
                      <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                        {lead.id}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      <span style={{ color: '#94A3B8' }}>{lead.matchReasoning}</span>
                      <span style={{ color: '#64748B', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {new Date(lead.approvedAtUtc).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
