// Client-side Google OAuth via Google Identity Services (GIS) implicit flow.
//
// Zero-knowledge by design: the access token lives only in this module's memory
// (a plain variable) for the lifetime of the tab. It is NEVER written to
// localStorage/cookies, never sent to this site's origin, and is used solely to
// call googleapis.com directly from the browser. Closing the tab discards it.
//
// Scope is read-only: youtube.readonly. We can read the user's subscriptions,
// nothing more — no posting, no editing, no deleting.

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

let gisReady: Promise<void> | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0;

function loadGis(): Promise<void> {
  if (gisReady) return gisReady;
  gisReady = new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) return resolve();
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Google sign-in. Check your connection or ad-blocker."));
    document.head.appendChild(s);
  });
  return gisReady;
}

export function hasGoogleToken(): boolean {
  return !!accessToken && Date.now() < tokenExpiry;
}

export function getGoogleToken(): string | null {
  return hasGoogleToken() ? accessToken : null;
}

export function signOutGoogle() {
  const tok = accessToken;
  accessToken = null;
  tokenExpiry = 0;
  if (tok && (window as any).google?.accounts?.oauth2?.revoke) {
    (window as any).google.accounts.oauth2.revoke(tok, () => {});
  }
}

// Triggers the Google consent popup and resolves with an access token.
// `clientId` is the user's own OAuth Client ID (entered in the UI) so the app
// ships with no embedded credentials.
export async function signInWithGoogle(clientId: string): Promise<string> {
  await loadGis();
  return new Promise((resolve, reject) => {
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPE,
        callback: (resp: any) => {
          if (resp?.error) {
            reject(new Error(`Google sign-in failed: ${resp.error}`));
            return;
          }
          accessToken = resp.access_token;
          // expires_in is seconds; subtract a small safety margin
          tokenExpiry = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
          resolve(resp.access_token);
        },
      });
      client.requestAccessToken({ prompt: "" });
    } catch (e: any) {
      reject(new Error(e?.message || "Google sign-in could not start."));
    }
  });
}
