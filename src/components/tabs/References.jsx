import React from 'react';

export default function References({ references = [] }) {
  if (!references.length) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No references found
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Mono', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {references.map((ref, idx) => (
        <div
          key={ref.id || idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '10px 0',
          }}
        >
          {ref.emoji && (
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
              {ref.emoji}
            </span>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700 }}>
                {ref.label}
              </span>
              {ref.category && (
                <span
                  style={{
                    color: '#f59e0b',
                    border: '1px solid #f59e0b44',
                    borderRadius: 9999,
                    padding: '1px 8px',
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                >
                  {ref.category}
                </span>
              )}
            </div>
            {ref.description && (
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                {ref.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
