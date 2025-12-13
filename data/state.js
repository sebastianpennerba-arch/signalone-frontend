/**
 * SignalOne - Global State Management
 * Live-First Architecture
 */

export const AppState = {
  // === MODE (ALWAYS LIVE FIRST!) ===
  mode: 'live', // 'live' | 'demo' - DEFAULT IS LIVE!
  
  // === CHANNEL & BRAND (GLOBAL FOR ALL MODULES) ===
  selectedChannel: '', // '', 'meta', 'google', 'tiktok'
  selectedBrand: null, // Brand object
  selectedCampaign: null, // Campaign object or null for "all"
  
  // === META CONNECTION ===
  metaConnected: false,
  metaToken: null,
  metaUser: null,
  
  // === CURRENT VIEW ===
  currentView: 'welcome', // Start with welcome screen
  
  // === SETTINGS ===
  settings: {
    theme: 'dark',
    currency: 'EUR',
    timezone: 'CET',
    cacheTtl: 300000,
    defaultRange: '30d'
  },
  
  // === STATUS INDICATORS ===
  systemStatus: 'green', // 'green' | 'yellow' | 'red'
  performanceStatus: 'green',
  dataModeStatus: 'yellow', // yellow = not connected yet
  
  // === UI FLAGS ===
  notifications: [],
  showWelcome: true, // Show welcome until channel selected
  
  // === MODULE LOAD FLAGS ===
  dashboardLoaded: false,
  creativesLoaded: false,
  campaignsLoaded: false
};

/**
 * Update State and trigger reactivity
 */
export function updateState(updates) {
  Object.assign(AppState, updates);
  
  // Dispatch global state change event
  window.dispatchEvent(new CustomEvent('appStateChange', {
    detail: updates
  }));
  
  console.log('[State] Updated:', updates);
}

/**
 * Reset to initial state (Live-first!)
 */
export function resetState() {
  AppState.mode = 'live';
  AppState.selectedChannel = '';
  AppState.selectedBrand = null;
  AppState.selectedCampaign = null;
  AppState.metaConnected = false;
  AppState.metaToken = null;
  AppState.metaUser = null;
  AppState.currentView = 'welcome';
  AppState.showWelcome = true;
  AppState.dataModeStatus = 'yellow';
  
  updateState({ reset: true });
}

/**
 * Check if we should show welcome screen
 */
export function shouldShowWelcome() {
  if (AppState.mode === 'live') {
    // Live: Show welcome if not connected OR no channel selected
    return !AppState.metaConnected || !AppState.selectedChannel;
  } else {
    // Demo: Show welcome if no channel/brand selected
    return !AppState.selectedChannel || !AppState.selectedBrand;
  }
}
