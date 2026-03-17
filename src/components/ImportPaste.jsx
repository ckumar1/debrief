import React, { useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'IBM Plex Mono, monospace',
  },
  modal: {
    background: '#0d1117',
    border: '1px solid #1a2030',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  heading: {
    color: '#e2e8f0',
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  label: {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '4px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#07090f',
    border: '1px solid #1a2030',
    borderRadius: '6px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'IBM Plex Mono, monospace',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    minHeight: '240px',
    padding: '10px 12px',
    background: '#07090f',
    border: '1px solid #1a2030',
    borderRadius: '6px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'IBM Plex Mono, monospace',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  importBtn: {
    padding: '10px 20px',
    background: '#f59e0b',
    color: '#07090f',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
  },
  importBtnDisabled: {
    padding: '10px 20px',
    background: '#334155',
    color: '#94a3b8',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'not-allowed',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #1a2030',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
  },
};

export default function ImportPaste({ onImport, onClose }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');

  const canImport = text.trim().length > 0;

  const handleImport = () => {
    if (canImport) {
      onImport(text, fileName || 'Untitled Meeting');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <h2 style={styles.heading}>Paste Transcript</h2>

        <div>
          <label style={styles.label}>Meeting Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Weekly Standup"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div>
          <label style={styles.label}>Transcript</label>
          <textarea
            style={styles.textarea}
            placeholder="Paste your meeting transcript here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={canImport ? styles.importBtn : styles.importBtnDisabled}
            disabled={!canImport}
            onClick={handleImport}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
