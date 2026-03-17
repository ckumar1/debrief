import React from 'react';
import { getParticipantColor, getParticipantInitials } from '../lib/colors.js';

const styles = {
  card: {
    background: '#0d1117',
    border: '1px solid #1a2030',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    fontFamily: 'IBM Plex Mono, monospace',
  },
  cardHover: {
    borderColor: '#f59e0b',
  },
  cardError: {
    background: '#1a0808',
    border: '1px solid #ef4444',
  },
  title: {
    color: '#e2e8f0',
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 8px 0',
  },
  meta: {
    display: 'flex',
    gap: '16px',
    color: '#94a3b8',
    fontSize: '13px',
  },
  processingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#f59e0b',
    fontSize: '13px',
    marginTop: '8px',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid #1a2030',
    borderTop: '2px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorMsg: {
    color: '#ef4444',
    fontSize: '13px',
    marginTop: '8px',
  },
};

export default function MeetingCard({ meeting, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  const isProcessing = meeting.status === 'processing';
  const isError = meeting.status === 'error';

  const title = meeting.extracted?.meta?.title || meeting.fileName || 'Untitled Meeting';
  const date = meeting.importedAt
    ? new Date(meeting.importedAt).toLocaleDateString()
    : '';
  const participantCount = meeting.extracted?.meta?.participants?.length || 0;
  const taskCount = meeting.extracted?.tasks?.length || 0;

  const cardStyle = {
    ...styles.card,
    ...(isError ? styles.cardError : {}),
    ...(hovered && !isError ? styles.cardHover : {}),
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={cardStyle}
        onClick={() => onClick?.(meeting)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={styles.title}>{title}</div>
        <div style={styles.meta}>
          {date && <span>{date}</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {(meeting.extracted?.meta?.participants || []).map((name) => (
              <span
                key={name}
                title={name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#07090f',
                  background: getParticipantColor(name),
                }}
              >
                {getParticipantInitials(name)}
              </span>
            ))}
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
          <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
        </div>
        {isProcessing && (
          <div style={styles.processingRow}>
            <div style={styles.spinner} />
            <span>Processing...</span>
          </div>
        )}
        {isError && (
          <div style={styles.errorMsg}>
            {meeting.error || 'An error occurred'}
          </div>
        )}
      </div>
    </>
  );
}
