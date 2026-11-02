import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ExternalLink, X, ShieldCheck, Sparkles } from 'lucide-react';
import GlowingScoreRing from './GlowingScoreRing';

export default function LeadApprovalModal({ lead, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(lead, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '2.25rem',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.15)',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '0.6rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={26} color="#34D399" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                Lead Approved & Contract Exported
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={12} />
                ApprovedLead v1 Standard Contract • RFC 9562 UUIDv7
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-glass-secondary"
            style={{ padding: '0.35rem', borderRadius: '0.5rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Lead Details Grid */}
        <div style={{
          backgroundColor: 'rgba(3, 7, 18, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0.85rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.15rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Lead UUIDv7 (Time-Ordered)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', marginTop: '0.2rem' }}>
              {lead.id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Student Identity
            </div>
            <div style={{ fontSize: '0.9rem', color: '#F9FAFB', fontWeight: 500, marginTop: '0.2rem' }}>
              {lead.studentEmail || lead.studentId}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Target Faculty & Lab
            </div>
            <div style={{ fontSize: '0.95rem', color: '#F9FAFB', fontWeight: 700, marginTop: '0.2rem' }}>
              {lead.professorName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Institution & Program
            </div>
            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
              {lead.universityName} — {lead.programName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Fit Score & Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge-neon-green">
                ● {lead.status}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>
                {lead.fitScore}% Fit
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Approved Timestamp (UTC)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
              {new Date(lead.approvedAtUtc).toLocaleString()}
            </div>
          </div>
        </div>

        {/* JSON Preview Block */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
              VERIFIED CONTRACT PAYLOAD (JSON)
            </span>
            <button
              onClick={handleCopyJson}
              className="btn-glass-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard' : 'Copy Payload'}
            </button>
          </div>
          <pre style={{
            backgroundColor: 'rgba(3, 7, 18, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0.65rem',
            padding: '1rem',
            fontSize: '0.78rem',
            color: '#34D399',
            maxHeight: '190px',
            overflowY: 'auto'
          }}>
            {JSON.stringify(lead, null, 2)}
          </pre>
        </div>

        {/* Action Button */}
        <div>
          <button onClick={onClose} className="btn-glow-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Close Contract
          </button>
        </div>
      </div>
    </div>
  );
}
