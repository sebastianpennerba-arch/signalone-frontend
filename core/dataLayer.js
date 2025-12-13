/* ============================================================================
   SignalOne Titanium Core – DataLayer
   ----------------------------------------------------------------------------
   Zuständig für:
   - Einheitliche API Calls
   - Demo vs Live Mode Switching
   - Automatisches Caching
   - Hetzner Backend Kommunikation
   - Module-Datenversorgung (Dashboard, Campaigns, Creatives…)
============================================================================ */

import AppState from "./state.js";
import { FRONTEND_CONFIG } from "./config.js";
import MetaAuth from "./metaAuth.js";

/* ============================================================================
   ENDPOINT BUILDER
============================================================================ */

function endpoint(path) {
  return `${FRONTEND_CONFIG.backendUrl}${path}`;
}

/* ============================================================================
   FETCH WRAPPER
   Automatischer Token-Check + DemoFallback
============================================================================ */

async function apiFetch(path, options = {}) {
  const mode = resolveEffectiveDataMode();

  // DEMO MODE
  if (mode === "demo") {
    return loadDemo(path);
  }

  // LIVE MODE
  const token = AppState.meta.accessToken;
  if (!token) {
    console.warn("[DataLayer] Kein Token – fallback Demo");
    return loadDemo(path);
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(endpoint(path), { ...options, headers });

    if (!res.ok) {
      console.warn("[DataLayer] Backend-Fehler – fallback Demo:", res.status);
      return loadDemo(path);
    }

    return await res.json();
  } catch (err) {
    console.error("[DataLayer] fetch() Fehler – fallback Demo:", err);
    return loadDemo(path);
  }
}

/* ============================================================================
   EFFECTIVE DATA MODE
============================================================================ */

export function resolveEffectiveDataMode() {
  const mode = AppState.settings.dataMode;
  const liveOk = MetaAuth.isConnected();

  if (mode === "demo") return "demo";
  if (mode === "live") return liveOk ? "live" : "demo";

  // AUTO
  return liveOk ? "live" : "demo";
}

/* ============================================================================
   DEMO DATA LOADER
   (wird später modularisiert in /data/demo/)
============================================================================ */

import DemoData from "../data/demo/demoData.js";

function loadDemo(path) {
  // Dashboard
  if (path === "/meta/insights/overview") return DemoData.dashboard;

  // Ad Accounts
  if (path === "/meta/accounts") return DemoData.accounts;

  // Campaigns
  if (path === `/meta/campaigns/${AppState.selectedAccountId}`) {
    return DemoData.campaigns;
  }

  // Ads
  if (path === `/meta/ads/${AppState.selectedAccountId}`) {
    return DemoData.ads;
  }

  // Creatives
  if (path === `/meta/creatives/${AppState.selectedAccountId}`) {
    return DemoData.creatives;
  }

  console.warn("[DataLayer] Demo-Fallback for:", path);
  return {};
}

/* ============================================================================
   PUBLIC API – CENTRAL DATA FUNCTIONS
============================================================================ */

export const DataLayer = {
  async loadDashboardOverview() {
    const data = await apiFetch("/meta/insights/overview");
    AppState.dashboardMetrics = data;
    AppState.dashboardLoaded = true;
    return data;
  },

  async loadAdAccounts() {
    const data = await apiFetch("/meta/accounts");
    AppState.meta.adAccounts = data;
    return data;
  },

  async loadCampaigns(accountId = null) {
    const acc = accountId || AppState.selectedAccountId;
    if (!acc) return [];

    const data = await apiFetch(`/meta/campaigns/${acc}`);
    AppState.meta.campaigns = data;
    AppState.campaignsLoaded = true;
    return data;
  },

  async loadAds(accountId = null) {
    const acc = accountId || AppState.selectedAccountId;
    if (!acc) return [];

    const data = await apiFetch(`/meta/ads/${acc}`);
    AppState.meta.ads = data;
    return data;
  },

  async loadCreatives(accountId = null) {
    const acc = accountId || AppState.selectedAccountId;
    if (!acc) return [];

    const data = await apiFetch(`/meta/creatives/${acc}`);
    AppState.meta.creatives = data;
    AppState.creativesLoaded = true;
    return data;
  }
};

/* ============================================================================
   DEFAULT EXPORT
============================================================================ */

export default DataLayer;
