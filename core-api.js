/**
 * SignalOne - CORE API
 * 
 * EINZIGE Schnittstelle zwischen Core Layer und Module Layer
 * Module dürfen NUR über diese API mit dem Core kommunizieren
 */

import { AppState, updateState } from './data/state.js';

/**
 * Core API - Öffentliche Methoden für Module
 */
export const CoreAPI = {
  
  // ===================================
  // READ STATE (Module können lesen)
  // ===================================
  
  /**
   * Get current state (Read-Only Copy)
   */
  getState() {
    return { ...AppState };
  },
  
  /**
   * Get current mode
   */
  getMode() {
    return AppState.mode;
  },
  
  /**
   * Get current channel
   */
  getChannel() {
    return AppState.selectedChannel;
  },
  
  /**
   * Get current brand
   */
  getBrand() {
    return AppState.selectedBrand;
  },
  
  /**
   * Get current campaign
   */
  getCampaign() {
    return AppState.selectedCampaign;
  },
  
  /**
   * Check if connected to live data
   */
  isLiveConnected() {
    return AppState.metaConnected;
  },
  
  // ===================================
  // WRITE STATE (Kontrolliert)
  // ===================================
  
  /**
   * Change mode (Demo/Live)
   * Triggers full reset and welcome screen
   */
  setMode(mode) {
    if (mode !== 'demo' && mode !== 'live') {
      console.error('[CoreAPI] Invalid mode:', mode);
      return false;
    }
    
    console.log('[CoreAPI] Mode change requested:', mode);
    
    // Dispatch event to Core
    window.dispatchEvent(new CustomEvent('coreAction', {
      detail: {
        action: 'setMode',
        payload: { mode }
      }
    }));
    
    return true;
  },
  
  /**
   * Request navigation to a view
   */
  navigate(viewId) {
    window.dispatchEvent(new CustomEvent('navigateTo', {
      detail: viewId
    }));
  },
  
  /**
   * Show toast message
   */
  toast(message, type = 'info') {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message, type }
    }));
  },
  
  /**
   * Show global loader
   */
  showLoader(message) {
    if (window.SignalOne?.showGlobalLoader) {
      window.SignalOne.showGlobalLoader(message);
    }
  },
  
  /**
   * Hide global loader
   */
  hideLoader() {
    if (window.SignalOne?.hideGlobalLoader) {
      window.SignalOne.hideGlobalLoader();
    }
  },
  
  /**
   * Open modal
   */
  openModal(title, bodyHtml) {
    if (window.SignalOne?.openModal) {
      window.SignalOne.openModal(title, bodyHtml);
    }
  },
  
  /**
   * Close modal
   */
  closeModal() {
    if (window.SignalOne?.closeModal) {
      window.SignalOne.closeModal();
    }
  },
  
  /**
   * Request reload of current module
   */
  reloadModule() {
    window.dispatchEvent(new CustomEvent('reloadAllModules'));
  },
  
  // ===================================
  // EVENT SUBSCRIPTION (Module können lauschen)
  // ===================================
  
  /**
   * Subscribe to state changes
   */
  onStateChange(callback) {
    window.addEventListener('appStateChange', (event) => {
      callback(event.detail);
    });
  },
  
  /**
   * Subscribe to mode changes
   */
  onModeChange(callback) {
    window.addEventListener('modeChanged', (event) => {
      callback(event.detail.mode);
    });
  }
};

/**
 * Make Core API globally available
 */
window.CoreAPI = CoreAPI;

console.log('✅ Core API initialized');
