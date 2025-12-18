/* ============================================================
   SignalOne Titanium Core – Global Config
   ------------------------------------------------------------
   Zentraler Ort für:
   - Meta OAuth Config
   - API Keys
   - Redirect URIs
   - Provider-übergreifende Einstellungen (Meta, TikTok, Google…)
   - Später: Feature Flags, Environment Overrides
============================================================== */

/**
 * META – APP ID
 * --------------------------------------
 * In Produktion wird dieser Wert dynamisch
 * vom Backend/Hetztner-ENV bereitgestellt.
 */
export const META_APP_ID = "732040642590155";

/**
 * META – OAuth Konfiguration
 * --------------------------------------
 * redirectUri zeigt auf deinen Frontend-Endpunkt,
 * der später das Token vom Backend bestätigt.
 */
export const META_OAUTH_CONFIG = {
  appId: META_APP_ID,
  redirectUri: "https://signalone-frontend.onrender.com/meta-auth/",
  scopes: "ads_read,ads_management,business_management",
  responseType: "code",       // Zukunft: Code Exchange Flow
  display: "popup"
};


/* ============================================================
   GLOBAL PROVIDER CONFIGS (Vorbereitet)
============================================================== */

/**
 * Social Media Provider:
 * Nur Meta ist aktiv. Alle anderen Coming Soon.
 */
export const PROVIDERS = {
  meta: {
    key: "meta",
    label: "Meta (Facebook & Instagram)",
    active: true,
    icon: "/Logo_re_tr.png",
    oauth: META_OAUTH_CONFIG
  },

  tiktok: {
    key: "tiktok",
    active: false,
    label: "TikTok Ads",
    icon: "/icons/tiktok.png",
    oauth: null // kommt später
  },

  google: {
    key: "google",
    active: false,
    label: "Google Ads",
    icon: "/icons/google.png",
    oauth: null
  },

  snapchat: {
    key: "snapchat",
    active: false,
    label: "Snapchat Ads",
    icon: "/icons/snapchat.png",
    oauth: null
  },

  pinterest: {
    key: "pinterest",
    active: false,
    label: "Pinterest Ads",
    icon: "/icons/pinterest.png",
    oauth: null
  }
};


/* ============================================================
   FRONTEND GLOBAL CONFIG
============================================================== */

export const FRONTEND_CONFIG = {
  version: "1.0.0-titanium",
  environment: "production",

  // Backend URL — Hetzner-ready
  backendUrl:
    window.SIGNALONE_BACKEND_URL ||
    "https://signalone-backend.onrender.com",

  cache: {
    metaCacheTtlMinutes: 15,
    defaultTimeRange: "last_30d"
  }
};


/* ============================================================
   EXPORT GLOBAL DEFAULT
============================================================== */

export default {
  META_APP_ID,
  META_OAUTH_CONFIG,
  PROVIDERS,
  FRONTEND_CONFIG
};
