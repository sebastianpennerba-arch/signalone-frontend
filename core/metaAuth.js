/* ============================================================================
   SignalOne Titanium Core – MetaAuth
   ----------------------------------------------------------------------------
   Zuständig für:
   - Demo-Authentifizierung (Mock)
   - Echte Meta OAuth 2.0 Autorisierung (Popup)
   - Persistenz in LocalStorage
   - Synchronisation in AppState
   - Token-Handling
   - Ad Account Fetches
   - User-Fetches
============================================================================ */

import { META_OAUTH_CONFIG, PROVIDERS, FRONTEND_CONFIG } from "./config.js";
import AppState, { resetAppState } from "./state.js";

/* ============================================================================
   CONSTANTS
============================================================================ */

const STORAGE_KEY = "signalone_meta_auth_v2";

/* ============================================================================
   INTERNAL STATE (Mirrored to AppState)
============================================================================ */

let authState = {
  connected: false,
  accessToken: null,
  user: null,
  accountId: null,
  accountName: null,
  mode: "demo" // "demo" | "live"
};

/* ============================================================================
   UTILITIES
============================================================================ */

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  } catch (err) {
    console.warn("[MetaAuth] localStorage save failed:", err);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    authState = { ...authState, ...JSON.parse(raw) };
  } catch (err) {
    console.warn("[MetaAuth] localStorage load failed:", err);
  }
}

function syncToAppState() {
  AppState.metaConnected = authState.connected;

  AppState.meta.accessToken = authState.accessToken;
  AppState.meta.user = authState.user;
  AppState.meta.accountId = authState.accountId;
  AppState.meta.accountName = authState.accountName;
  AppState.meta.mode = authState.mode;

  if (window.updateMetaUI) window.updateMetaUI();
  if (window.updateSidebarDataModeLabel) window.updateSidebarDataModeLabel();
}

/* ============================================================================
   DEMO MODE – Actively Used Until Hetzner Backend is Ready
============================================================================ */

function connectDemo() {
  return new Promise((resolve) => {
    showLoader();

    setTimeout(() => {
      authState.connected = true;
      authState.mode = "demo";
      authState.accessToken = "demo_token_123";

      authState.user = {
        id: "demo_user_001",
        name: "SignalOne Demo User"
      };

      authState.accountId = "demo_account_123";
      authState.accountName = "Demo Werbekonto";

      saveToStorage();
      syncToAppState();

      hideLoader();
      toast("Meta Ads (Demo) verbunden.", "success");

      resolve(true);
    }, 800);
  });
}

/* ============================================================================
   POPUP AUTH (LIVE FLOW)
   OAuth → Backend Token Exchange → Access Token → AppState Sync
============================================================================ */

function connectLiveWithPopup() {
  return new Promise((resolve, reject) => {
    const provider = PROVIDERS.meta;
    if (!provider.active) {
      toast("Meta ist der einzige aktive Kanal.", "error");
      return reject("inactive");
    }

    const url = buildOAuthUrl();

    // Neues Fenster öffnen
    const popup = window.open(
      url,
      "MetaAuthPopup",
      "width=600,height=700,menubar=no,toolbar=no,status=no"
    );

    if (!popup) {
      toast("Popup blockiert! Bitte Popups erlauben.", "error");
      return reject("blocked");
    }

    showLoader();

    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        hideLoader();
        toast("Meta Login abgebrochen.", "error");
        return reject("closed");
      }
    }, 400);

    window.addEventListener("message", handlePopupMessage);

    function handlePopupMessage(event) {
      if (!event.data || !event.data.type) return;

      if (event.data.type === "META_AUTH_SUCCESS") {
        window.removeEventListener("message", handlePopupMessage);
        clearInterval(interval);
        popup.close();

        const { accessToken, user, accounts } = event.data.payload;

        authState.connected = true;
        authState.mode = "live";
        authState.accessToken = accessToken;
        authState.user = user;
        authState.accountId = accounts?.[0]?.id || null;
        authState.accountName = accounts?.[0]?.name || "";

        saveToStorage();
        syncToAppState();

        hideLoader();
        toast("Meta Ads (LIVE) verbunden.", "success");

        resolve(true);
      }

      if (event.data.type === "META_AUTH_ERROR") {
        window.removeEventListener("message", handlePopupMessage);
        clearInterval(interval);
        popup.close();
        hideLoader();
        toast("Meta Login fehlgeschlagen.", "error");

        reject(event.data.error);
      }
    }
  });
}

/* ============================================================================
   BUILD OAUTH URL
============================================================================ */

function buildOAuthUrl() {
  const { appId, redirectUri, scopes } = META_OAUTH_CONFIG;

  return (
    `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&response_type=token` +
    `&display=popup`
  );
}

/* ============================================================================
   DISCONNECT
============================================================================ */

function disconnect() {
  authState = {
    connected: false,
    accessToken: null,
    user: null,
    accountId: null,
    accountName: null,
    mode: "demo"
  };

  saveToStorage();
  syncToAppState();

  toast("Meta-Verbindung getrennt.", "info");
}

/* ============================================================================
   INITIALISIERUNG
============================================================================ */

function init() {
  loadFromStorage();
  syncToAppState();
}

/* ============================================================================
   Loader & Toast (Frontend Hooks)
============================================================================ */

function showLoader() {
    if (window.showGlobalLoader) window.showGlobalLoader();
}

function hideLoader() {
    if (window.hideGlobalLoader) window.hideGlobalLoader();
}

function toast(msg, type = "info") {
    if (window.showToast) window.showToast(msg, type);
}

/* ============================================================================
   EXPORT – Titanium API
============================================================================ */

export const MetaAuth = {
  init,
  connectDemo,
  connectLiveWithPopup,
  disconnect,
  isConnected: () => authState.connected,
  getState: () => ({ ...authState })
};

export default MetaAuth;
