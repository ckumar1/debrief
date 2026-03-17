import React from 'react';

export default function Decisions({ decisions = [] }) {
  if (!decisions.length) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No decisions found
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Mono', display: 'flex', flexDirection: 'column' }}>
      {decisions.map((decision, idx) => (
        <div
          key={decision.id || idx}
          style={{
            padding: '14px 0',
            borderBottom: idx < decisions.length - 1 ? '1px solid #1a2030' : 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <span
            style={{
              color: '#22c55e',
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {'\u2713'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>
              {decision.title}
            </div>
            {decision.reason && (
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                {decision.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
