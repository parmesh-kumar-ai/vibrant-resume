/**
 * Google Drive Integration Utility
 * Uses Google Identity Services (GIS) for OAuth and Google Picker for file selection.
 */

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly openid profile email';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

export async function fetchGoogleUserProfile(token: string) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
}

// Use the new key provided by the user as the primary key
const API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

/* ─── Token helpers ─── */
const TOKEN_KEY = 'vibrant-gdrive-token';

export function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
        const t = JSON.parse(raw);
        // token expired?
        if (t.expires_at && Date.now() > t.expires_at) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        return t.access_token;
    } catch { return null; }
}

function storeToken(tokenResponse: any) {
    const data = {
        access_token: tokenResponse.access_token,
        expires_at: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

export function isLinked(): boolean {
    return !!getStoredToken();
}

export function unlinkDrive() {
    localStorage.removeItem(TOKEN_KEY);
}

/* ─── Load GIS script ─── */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src; s.async = true; s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
    });
}

/* ─── OAuth: request access token ─── */
export async function requestAccessToken(): Promise<string> {
    const existing = getStoredToken();
    if (existing) return existing;

    if (!CLIENT_ID) throw new Error('Google Client ID not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local');
    await loadScript('https://accounts.google.com/gsi/client');

    return new Promise((resolve, reject) => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (resp: any) => {
                if (resp.error) { reject(new Error(resp.error)); return; }
                storeToken(resp);
                resolve(resp.access_token);
            },
        });
        client.requestAccessToken();
    });
}

/* ─── Google Picker: pick file from Drive ─── */
export async function pickFileFromDrive(): Promise<{ id: string; name: string; mimeType: string } | null> {
    const token = await requestAccessToken();
    if (!API_KEY) throw new Error('Google API Key not configured. Add NEXT_PUBLIC_GOOGLE_API_KEY to .env.local');
    await loadScript('https://apis.google.com/js/api.js');

    // load picker
    await new Promise<void>((resolve) => {
        (window as any).gapi.load('picker', { callback: resolve });
    });

    return new Promise((resolve) => {
        const view = new (window as any).google.picker.DocsView()
            .setIncludeFolders(false)
            .setMimeTypes('application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/msword');

        const picker = new (window as any).google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token)
            .setDeveloperKey(API_KEY)
            .setTitle('Select your resume from Google Drive')
            .setCallback((data: any) => {
                if (data.action === 'picked' && data.docs?.[0]) {
                    const doc = data.docs[0];
                    resolve({ id: doc.id, name: doc.name, mimeType: doc.mimeType });
                } else if (data.action === 'cancel') {
                    resolve(null);
                }
            })
            .build();
        picker.setVisible(true);
    });
}

/* ─── Read file content from Drive ─── */
export async function readDriveFileContent(fileId: string, mimeType: string): Promise<string> {
    const token = getStoredToken();
    if (!token) throw new Error('Not authenticated');

    // For Google Docs fmt, export as plain text
    if (mimeType.includes('google-apps')) {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to read file');
        return res.text();
    }

    // For PDFs, use the parse API
    if (mimeType === 'application/pdf') {
        // download the binary
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to download file');
        const blob = await res.blob();

        // send to our parse API to extract text
        const formData = new FormData();
        formData.append('file', blob, 'resume.pdf');
        const parseRes = await fetch('/api/parse', { method: 'POST', body: formData });
        const data = await parseRes.json();
        if (data.text) return data.text;
        throw new Error('Failed to parse PDF');
    }

    // For plain text, docx etc — download as text
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to read file');
    return res.text();
}

/* ─── Upload file (PDF) to Drive ─── */
export async function uploadToDrive(blob: Blob, fileName: string): Promise<{ id: string; name: string; webViewLink: string }> {
    const token = await requestAccessToken();

    const metadata = {
        name: fileName,
        mimeType: blob.type || 'application/pdf',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Upload failed: ${err}`);
    }

    return res.json();
}
