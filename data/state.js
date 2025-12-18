/**
 * SignalOne - Centralized App State
 * ✅ ADDED settings.range for 24h/7d toggle
 */

export const AppState = {
  // Core
  mode: 'demo', // 'demo' | 'live'
  currentView: 'welcome',
  
  // Data Source
  selectedChannel: '', // 'meta' | 'tiktok' | 'google'
  selectedBrand: null,
  selectedCampaign: null,
  
  // Meta Connection
  metaConnected: false,
  metaToken: null,
  
  // Settings
  settings: {
    range: '7d', // ✅ NEW: '24h' | '7d' for dashboard toggle
    theme: 'titanium',
    currency: 'EUR',
    language: 'de'
  },
  
  // Status
  systemStatus: 'green',
  performanceStatus: 'green',
  dataModeStatus: 'yellow',
  
  // Cache
  _brands: null,
  _campaigns: {},
  _creatives: {}
};

/**
 * Update App State
 */
export function updateState(updates) {
  if (!updates || typeof updates !== 'object') {
    console.warn('[State] Invalid updates:', updates);
    return;
  }
  
  Object.assign(AppState, updates);
  
  console.log('[State] Updated:', Object.keys(updates));
  
  window.dispatchEvent(new CustomEvent('appStateChange', {
    detail: { ...AppState }
  }));
}

/**
 * Reset State to Defaults
 */
export function resetState() {
  Object.assign(AppState, {
    mode: 'demo',
    currentView: 'welcome',
    selectedChannel: '',
    selectedBrand: null,
    selectedCampaign: null,
    metaConnected: false,
    metaToken: null,
    settings: {
      range: '7d',
      theme: 'titanium',
      currency: 'EUR',
      language: 'de'
    },
    dataModeStatus: 'yellow',
    _brands: null,
    _campaigns: {},
    _creatives: {}
  });
  
  console.log('[State] Reset to defaults');
  
  window.dispatchEvent(new CustomEvent('appStateChange', {
    detail: { ...AppState }
  }));
}

/**
 * Check if welcome screen should be shown
 */
export function shouldShowWelcome() {
  if (!AppState.selectedChannel) return true;
  if (AppState.mode === 'live' && !AppState.metaConnected) return true;
  if (!AppState.selectedBrand) return true;
  return false;
}

console.log('✅ State Module initialized');
