/**
 * Google Drive Integration for Debrief
 *
 * Setup instructions:
 *
 * 1. Go to Google Cloud Console (https://console.cloud.google.com)
 * 2. Create a new project (or select an existing one)
 * 3. Enable the following APIs:
 *    - Google Drive API (APIs & Services > Library > search "Google Drive API")
 *    - Google Picker API (APIs & Services > Library > search "Google Picker API")
 * 4. Create an OAuth 2.0 Client ID:
 *    - Go to APIs & Services > Credentials
 *    - Click "Create Credentials" > "OAuth client ID"
 *    - Application type: Web application
 *    - Authorized JavaScript origins: http://localhost:5173
 *    - Copy the Client ID
 * 5. Create an API Key:
 *    - Go to APIs & Services > Credentials
 *    - Click "Create Credentials" > "API key"
 *    - Restrict the key to Google Picker API only (recommended)
 *    - Copy the API key
 * 6. Set the credentials in your .env file:
 *    VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
 *    VITE_GOOGLE_API_KEY=your-google-api-key
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let tokenClient = null;
let accessToken = null;

const TOKEN_STORAGE_KEY = 'debrief_google_token';

function saveToken(token) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
    token,
    expiresAt: Date.now() + 3500 * 1000, // Google tokens last ~1 hour, save with margin
  }));
}

function loadToken() {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Check whether Google Drive credentials are configured.
 */
export function isConfigured() {
  return !!(
    CLIENT_ID &&
    API_KEY &&
    CLIENT_ID !== 'your-client-id.apps.googleusercontent.com' &&
    API_KEY !== 'your-google-api-key'
  );
}

/**
 * Load the Google Identity Services (GSI) script and initialize the token client.
 */
export async function initGoogleAuth() {
  if (!isConfigured()) {
    throw new Error('Google Drive is not configured. See src/lib/drive.js for setup instructions.');
  }

  // Load GSI script if not already loaded
  if (!window.google?.accounts?.oauth2) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  // Load Google API client for Picker
  if (!window.gapi) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Google API client'));
      document.head.appendChild(script);
    });
  }

  // Load the Picker library
  await new Promise((resolve) => {
    window.gapi.load('picker', resolve);
  });

  // Initialize the token client
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {}, // Will be overridden in requestAccessToken
  });

  // Restore any saved token from sessionStorage
  accessToken = loadToken();
}

/**
 * Request an OAuth access token from the user via Google's consent flow.
 * Returns the access token string.
 */
export function requestAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized. Call initGoogleAuth() first.'));
      return;
    }

    // If we already have a valid saved token, resolve immediately
    if (accessToken) {
      resolve(accessToken);
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(`OAuth error: ${response.error}`));
        return;
      }
      accessToken = response.access_token;
      saveToken(accessToken);
      resolve(accessToken);
    };

    tokenClient.error_callback = (error) => {
      reject(new Error(`OAuth error: ${error.message || error.type}`));
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * Check whether a valid (non-expired) token exists.
 */
export function hasValidToken() {
  return !!(accessToken || loadToken());
}

/**
 * Open the Google Picker UI and let the user select a file.
 * Returns { id, name, mimeType } of the selected file, or null if cancelled.
 */
export function openPicker() {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      reject(new Error('No access token. Call requestAccessToken() first.'));
      return;
    }

    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setMimeTypes(
        'application/vnd.google-apps.document,text/plain,text/markdown,application/pdf'
      );

    const picker = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          resolve({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
          });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .build();

    picker.setVisible(true);
  });
}

/**
 * Fetch the text content of a file from Google Drive.
 * Handles Google Docs (exports as text/plain) and regular text files.
 *
 * @param {string} fileId - The Google Drive file ID
 * @param {string} mimeType - The file's MIME type
 * @returns {Promise<string>} The file content as plain text
 */
export async function fetchFileContent(fileId, mimeType) {
  if (!accessToken) {
    throw new Error('No access token. Call requestAccessToken() first.');
  }

  let url;

  if (mimeType === 'application/vnd.google-apps.document') {
    // Google Docs must be exported
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  } else {
    // Regular files can be downloaded directly
    url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch file content (${response.status}): ${err}`);
  }

  return response.text();
}
