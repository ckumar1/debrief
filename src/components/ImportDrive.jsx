import React, { useState } from 'react';
import {
  isConfigured,
  initGoogleAuth,
  requestAccessToken,
  openPicker,
  fetchFileContent,
  hasValidToken,
} from '../lib/drive.js';

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
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    textAlign: 'center',
  },
  heading: {
    color: '#e2e8f0',
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  description: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  setupMsg: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
    background: '#07090f',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid #1a2030',
    textAlign: 'left',
  },
  driveBtn: {
    padding: '12px 24px',
    background: '#f59e0b',
    color: '#07090f',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
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
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#f59e0b',
    fontSize: '14px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #1a2030',
    borderTop: '2px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorMsg: {
    color: '#ef4444',
    fontSize: '13px',
    background: '#1a0808',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    padding: '10px 14px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
};

export default function ImportDrive({ onImport, onClose }) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Connecting...');
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(hasValidToken());

  const configured = isConfigured();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    setLoadingText('Connecting...');

    try {
      await initGoogleAuth();

      if (!hasValidToken()) {
        const token = await requestAccessToken();
      }

      setAuthenticated(true);
      setLoadingText('Opening picker...');
      const pickerResult = await openPicker();

      if (!pickerResult) {
        setLoading(false);
        return;
      }

      setLoadingText('Fetching file...');
      const { id, name, mimeType } = pickerResult;
      const content = await fetchFileContent(id, mimeType);
      onImport(content, name, id);
    } catch (err) {
      setError(err.message || 'Failed to connect to Google Drive');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <h2 style={styles.heading}>Import from Google Drive</h2>

          {!configured ? (
            <>
              <p style={styles.setupMsg}>
                Google Drive integration is not configured. Set the following
                environment variables to enable it:
                <br /><br />
                <code>VITE_GOOGLE_CLIENT_ID</code> - Your Google OAuth client ID
                <br />
                <code>VITE_GOOGLE_API_KEY</code> - Your Google API key
                <br /><br />
                Create these in the Google Cloud Console with the Drive API and
                Picker API enabled.
              </p>
              <button style={styles.cancelBtn} onClick={onClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <p style={styles.description}>
                Connect to Google Drive to import a meeting transcript document.
              </p>

              {error && <div style={styles.errorMsg}>{error}</div>}

              {loading ? (
                <div style={styles.loadingRow}>
                  <div style={styles.spinner} />
                  <span>{loadingText}</span>
                </div>
              ) : (
                <button style={styles.driveBtn} onClick={handleConnect}>
                  {authenticated ? 'Open File Picker' : 'Connect to Google Drive'}
                </button>
              )}

              <button style={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
