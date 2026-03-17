import React from 'react';

export default function Architecture({ architecture }) {
  if (!architecture || (!architecture.layers?.length && !architecture.providers?.length && !architecture.pattern)) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No architecture discussed
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Mono', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Pattern header */}
      {architecture.pattern && (
        <div>
          <h3 style={{ color: '#f59e0b', fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
            {architecture.pattern}
          </h3>
          {architecture.description && (
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              {architecture.description}
            </p>
          )}
        </div>
      )}

      {/* Layer stack */}
      {architecture.layers && architecture.layers.length > 0 && (
        <div>
          <h4 style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Layers
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {architecture.layers.map((layer, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0d1117',
                  border: '1px solid #1a2030',
                  borderRadius: 6,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    color: '#f59e0b',
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 24,
                    textAlign: 'center',
                    background: '#f59e0b18',
                    borderRadius: 4,
                    padding: '2px 0',
                  }}
                >
                  {idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                    {layer.layer || layer.name}
                  </div>
                  {(layer.desc || layer.description) && (
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>
                      {layer.desc || layer.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider grid */}
      {architecture.providers && architecture.providers.length > 0 && (
        <div>
          <h4 style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Providers
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}
          >
            {architecture.providers.map((provider, idx) => {
              const borderColor = provider.color || '#1a2030';
              return (
                <div
                  key={idx}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #1a2030',
                    borderLeft: '3px solid ' + borderColor,
                    borderRadius: 6,
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, flex: 1 }}>
                      {provider.name}
                    </span>
                    {provider.status && (
                      <span
                        style={{
                          background: borderColor + '22',
                          color: borderColor,
                          border: '1px solid ' + borderColor + '44',
                          borderRadius: 9999,
                          padding: '1px 8px',
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {provider.status}
                      </span>
                    )}
                  </div>
                  {provider.note && (
                    <div style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.4 }}>
                      {provider.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
