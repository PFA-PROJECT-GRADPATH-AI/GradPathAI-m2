import React from 'react';

export default function GlowingScoreRing({ score = 0, size = 64, strokeWidth = 5.5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Determine glow color by score tier
  let ringColor = '#38BDF8';
  let stopColor = '#6366F1';
  let glowColor = 'rgba(56, 189, 248, 0.4)';

  if (score >= 90) {
    ringColor = '#10B981';
    stopColor = '#06B6D4';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (score < 60) {
    ringColor = '#F43F5E';
    stopColor = '#FB923C';
    glowColor = 'rgba(244, 63, 94, 0.4)';
  }

  const gradientId = `score-grad-${Math.round(score * 10)}`;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ringColor} />
            <stop offset="100%" stopColor={stopColor} />
          </linearGradient>
          <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={glowColor} />
          </filter>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Glowing Foreground Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${gradientId})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>

      {/* Percentage Center Label */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1
      }}>
        <span style={{ fontSize: size > 60 ? '1.15rem' : '0.85rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
          {Math.round(score)}
          <span style={{ fontSize: size > 60 ? '0.65rem' : '0.55rem', fontWeight: 600, color: '#94A3B8' }}>%</span>
        </span>
      </div>
    </div>
  );
}
