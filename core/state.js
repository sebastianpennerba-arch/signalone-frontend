/* ============================================================
   SignalOne Titanium Core – Global AppState
   ------------------------------------------------------------
   Einzigen gültigen globalen Zustand der App.
   - Keine UI-Logik
   - Keine MetaAuth-Implementierung
   - Keine Fetches
   - Reiner, purer State
============================================================== */

import { FRONTEND_CONFIG } from "./config.js";

/* ============================================================
   State Factory (sauberer Reset möglich)
============================================================== */

export function createDefaultAppState() {
  return {
    /* ---------------------------------------------------------
       VIEW / NAVIGATION
    --------------------------------------------------------- */
    currentModule: "dashboard",
    currentView: "dashboardView",

    /* ---------------------------------------------------------
       META STATUS
       (gefüllt durch metaAuth.js)
    --------------------------------------------------------- */
    metaConnected: false,

    meta: {
      accessToken: null,
      user: null,
      accountId: null,
      accountName: null,
      adAccounts: [],
      campaigns: [],
      ads: [],
      creatives: [],
      insightsByCampaign: {},
      mode: "demo" // "demo" | "live"
    },

    /* ---------------------------------------------------------
       SELEKTION
    --------------------------------------------------------- */
    selectedAccountId: null,
    selectedBrandId: null,
    selectedCampaignId: "ALL",

    /* ---------------------------------------------------------
       USER SETTINGS
    --------------------------------------------------------- */
    settings: {
      theme: "titanium",
      currency: "EUR",
      creativeLayout: "grid",

      /* Datenmodus:
         "auto" : Wenn Meta verbunden -> Live, sonst Demo
         "demo" : Immer Demo
         "live" : Erzwingt Live, bei Fehlern Fallback auf Demo
      */
      dataMode: "auto",
      demoMode: true,

      /* Dashboard / Kampagnen */
      defaultTimeRange: "last_30d",
      timeRangePreset: "last_30d",

      /* Social Media Auswahl (UI only, currently only meta active) */
      channel: "meta",

      /* Performance / Cache */
      metaCacheTtlMinutes: FRONTEND_CONFIG.cache.metaCacheTtlMinutes
    },

    /* ---------------------------------------------------------
       SYSTEM STATUS
    --------------------------------------------------------- */
    systemHealthy: true,
    systemChecks: {
      backendReachable: true,
      lastBackendCheck: null
    },

    /* ---------------------------------------------------------
       CACHE
       (gefüllt von DataLayer / MetaAuth / Module)
    --------------------------------------------------------- */
    metaCache: {
      adAccounts: null,
      campaignsByAccount: {},
      adsByAccount: {}
    },

    /* ---------------------------------------------------------
       MODULE DATA
    --------------------------------------------------------- */
    dashboardMetrics: null,
    campaignsLoaded: false,
    creativesLoaded: false,
    dashboardLoaded: false,

    testingLog: [],
    notifications: [],

    /* ---------------------------------------------------------
       INTERNAL
    --------------------------------------------------------- */
    config: {
      meta: {
        appId: FRONTEND_CONFIG.metaAppId || null
      }
    }
  };
}

/* ============================================================
   SINGLETON GLOBAL STATE
   (App.js und Module greifen auf dieselbe Instanz zu)
============================================================== */

export const AppState = createDefaultAppState();

/* ============================================================
   RESET-FUNKTION FÜR LOGOUT ODER WORKSPACE-SWITCH
============================================================== */

export function resetAppState() {
  const fresh = createDefaultAppState();
  Object.keys(AppState).forEach((key) => {
    AppState[key] = fresh[key];
  });
}

/* ============================================================
   EXPORT
============================================================== */

export default AppState;
