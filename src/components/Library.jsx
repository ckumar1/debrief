import React from 'react';
import MeetingCard from './MeetingCard';
import CrossMeeting from './CrossMeeting';

const styles = {
  container: {
    fontFamily: 'IBM Plex Mono, monospace',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  wordmark: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
    fontFamily: 'IBM Plex Mono, monospace',
  },
  wordmarkAccent: {
    color: '#f59e0b',
  },
  wordmarkWhite: {
    color: '#ffffff',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  outlineBtn: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#f59e0b',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  meetingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#334155',
    fontSize: '15px',
    fontFamily: 'IBM Plex Mono, monospace',
  },
};

export default function Library({ meetings, onSelectMeeting, onImportPaste, onImportDrive }) {
  const sorted = [...(meetings || [])].sort(
    (a, b) => new Date(b.importedAt) - new Date(a.importedAt)
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.wordmark}>
          <span style={styles.wordmarkAccent}>De</span>
          <span style={styles.wordmarkWhite}>brief</span>
        </h1>
        <div style={styles.headerButtons}>
          <button style={styles.outlineBtn} onClick={onImportDrive}>
            Import from Drive
          </button>
          <button style={styles.outlineBtn} onClick={onImportPaste}>
            Paste Transcript
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={styles.emptyState}>
          No meetings yet. Import a transcript to get started.
        </div>
      ) : (
        <>
          <div style={styles.meetingList}>
            {sorted.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => onSelectMeeting(meeting.id)}
              />
            ))}
          </div>
          <CrossMeeting meetings={sorted} />
        </>
      )}
    </div>
  );
}
