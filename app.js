/**
 * SignalOne - App.js
 * ✅ PHASE 1 FINAL + CACHE BUSTING + WELCOME SCREEN FIX
 * ✅ CLEANED: Time Range Toggle removed from Topbar
 * Module Context wird bei jedem loadModule() NEU erstellt
 * Damit bekommen Module IMMER die aktuellen AppState-Werte
 */

import { AppState, updateState, resetState, shouldShowWelcome } from './data/state.js';
import * as DataLayer from './data/index.js';

// ===================================
// CACHE BUSTING VERSION
// ===================================
const CACHE_VERSION = Date.now(); // Timestamp-based cache busting
console.log('🔥 Cache Version:', CACHE_VERSION);

// ===================================
// MODULE REGISTRY
// ===================================

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', requiresData: true },
  { id: 'creativeLibrary', label: 'Creative Library', icon: '🎨', requiresData: true },
  { id: 'campaigns', label: 'Campaigns', icon: '⚡', requiresData: true },
  { id: 'testingLog', label: 'Testing Log', icon: '🧪', requiresData: true },
  { id: 'sensei', label: 'Sensei', icon: '🧠', requiresData: true },
  { id: 'academy', label: 'Academy', icon: '📘', requiresData: false },
  { id: 'reports', label: 'Reports', icon: '📄', requiresData: true },
  { id: 'moreTools', label: 'More Tools', icon: '🔧', requiresData: false },
];

// ✅ CACHE-BUSTING MODULE LOADERS
const MODULE_LOADERS = {
  dashboard: () => import(`./packages/dashboard/index.js?v=${CACHE_VERSION}`),
  creativeLibrary: () => import(`./packages/creativeLibrary/index.js?v=${CACHE_VERSION}`),
  campaigns: () => import(`./packages/campaigns/index.js?v=${CACHE_VERSION}`),
  testingLog: () => import(`./packages/testingLog/index.js?v=${CACHE_VERSION}`),
  sensei: () => import(`./packages/sensei/index.js?v=${CACHE_VERSION}`),
  academy: () => import(`./packages/academy/index.js?v=${CACHE_VERSION}`),
  reports: () => import(`./packages/reports/index.js?v=${CACHE_VERSION}`),
  moreTools: () => import(`./packages/moreTools/index.js?v=${CACHE_VERSION}`),
  settings: () => import(`./packages/settings/index.js?v=${CACHE_VERSION}`),
};

let currentModule = null;
let currentModuleId = null;

// ===================================
// P2: MODULE CONTEXT (Core API for Modules)
// CRITICAL: IMMER mit aktuellem AppState!
// ===================================

function createModuleContext() {
  // CRITICAL FIX: AppState-Referenz wird bei jedem Aufruf NEU gelesen!
  return {
    appState: { ...AppState }, // Kopie um Mutation zu vermeiden

    getDataClient() {
      return DataLayer;
    },

    async ensureMetaConnected() {
      if (AppState.mode === 'live' && !AppState.metaConnected) {
        showToast('Bitte zuerst Meta verbinden', 'warning');
        throw new Error('Meta not connected');
      }
    },

    showToast,
    showGlobalLoader,
    hideGlobalLoader,

    openSenseiForCreative(creative, health) {
      if (window.openModal) {
        const html = `
          <p><strong>${health?.label || 'Analyse'}</strong> – Score ${health?.score || 0}</p>
          <p>${health?.reasonShort || 'Keine Daten verfügbar'}</p>
          <p style="margin-top:8px;font-size:12px;color:#6b7280;">
            ${health?.reasonLong || ''}
          </p>
        `;
        openModal('Sensei Analyse', html);
      } else {
        showToast(health?.reasonShort || 'Sensei Analyse', 'info');
      }
    }
  };
}

// ===================================
// CORE API EVENT HANDLER
// ===================================

window.addEventListener('coreAction', (event) => {
  const { action, payload } = event.detail || {};
  
  if (!action) {
    console.warn('[Core] Action missing in event');
    return;
  }
  
  console.log('[Core] Action received:', action, payload);
  
  try {
    switch (action) {
      case 'setMode':
        handleModeChange(payload?.mode);
        break;
      default:
        console.warn('[Core] Unknown action:', action);
    }
  } catch (error) {
    console.error('[Core] Action handler error:', error);
    showToast('Ein Fehler ist aufgetreten', 'error');
  }
});

function handleModeChange(newMode) {
  if (!newMode) {
    console.warn('[Core] Mode change called without mode');
    return;
  }
  
  console.log('[Core] Mode change to:', newMode);
  
  try {
    updateState({
      mode: newMode,
      selectedChannel: '',
      selectedBrand: null,
      selectedCampaign: null,
      metaConnected: false,
      dataModeStatus: 'yellow'
    });
    
    resetDropdowns();
    updateStatusDots();
    showWelcomeScreen();
    
    window.dispatchEvent(new CustomEvent('modeChanged', {
      detail: { mode: newMode }
    }));
    
    console.log('✅ Mode changed successfully');
  } catch (error) {
    console.error('[Core] Mode change error:', error);
    showToast('Modus-Wechsel fehlgeschlagen', 'error');
  }
}

function resetDropdowns() {
  try {
    const channelSelect = document.getElementById('channelSelect');
    const brandSelect = document.getElementById('brandSelect');
    const campaignSelect = document.getElementById('campaignSelect');
    const metaBtn = document.getElementById('metaConnectButton');
    
    if (channelSelect) channelSelect.value = '';
    if (brandSelect) {
      brandSelect.innerHTML = '<option value="">Erst Kanal wählen...</option>';
      brandSelect.disabled = true;
    }
    if (campaignSelect) {
      campaignSelect.innerHTML = '<option value="">Erst Brand wählen...</option>';
      campaignSelect.disabled = true;
    }
    if (metaBtn) {
      metaBtn.innerHTML = '<span>🔗</span><span>Verbinden</span>';
    }
  } catch (error) {
    console.error('[Core] Dropdown reset error:', error);
  }
}

// ===================================
// NAVIGATION
// ===================================

function buildSidebar() {
  try {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
      console.warn('[Sidebar] Navbar element not found');
      return;
    }
    
    navbar.innerHTML = '';
    
    MODULES.forEach(module => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'sidebar-nav-button';
      button.dataset.module = module.id;
      button.innerHTML = `
        <span class="sidebar-nav-icon">${module.icon}</span>
        <span class="sidebar-nav-label">${module.label}</span>
      `;
      
      button.addEventListener('click', () => {
        navigateTo(module.id);
      });
      
      li.appendChild(button);
      navbar.appendChild(li);
    });
  } catch (error) {
    console.error('[Sidebar] Build error:', error);
  }
}

function navigateTo(moduleId) {
  if (!moduleId) {
    console.warn('[Navigate] Module ID missing');
    return;
  }
  
  console.log('[Navigate]', moduleId);
  
  try {
    const module = MODULES.find(m => m.id === moduleId);
    
    if (module?.requiresData && shouldShowWelcome()) {
      console.log('[Navigate] Data not ready, showing welcome screen');
      showWelcomeScreen();
      return;
    }
    
    document.querySelectorAll('.sidebar-nav-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === moduleId);
    });
    
    updateState({ currentView: moduleId });
    loadModule(moduleId);
  } catch (error) {
    console.error('[Navigate] Error:', error);
    showToast('Navigation fehlgeschlagen', 'error');
  }
}

function showView(viewId) {
  if (!viewId) return;
  
  try {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('is-active');
    });
    
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.add('is-active');
    }
  } catch (error) {
    console.error('[ShowView] Error:', error);
  }
}

function showWelcomeScreen() {
  try {
    showView('welcomeView');
    updateState({ currentView: 'welcome' });
    currentModuleId = null;
    updateWelcomeScreenContent();
  } catch (error) {
    console.error('[Welcome] Error:', error);
  }
}

// ===================================
// P1-CRITICAL: WELCOME SCREEN REDESIGN
// ===================================

function updateWelcomeScreenContent() {
  const welcomeView = document.getElementById('welcomeView');
  if (!welcomeView) return;
  
  const isDemo = AppState.mode === 'demo';
  const hasChannel = !!AppState.selectedChannel;
  const hasConnection = isDemo || AppState.metaConnected;
  
  // Status indicators
  const channelStatus = hasChannel ? '✅' : '⭕';
  const connectionStatus = hasConnection ? '✅' : '⭕';
  const brandStatus = AppState.selectedBrand ? '✅' : '⭕';
  
  // Next action
  let nextAction = '';
  if (!hasChannel) {
    nextAction = 'Wähle einen Kanal oben aus';
  } else if (!hasConnection) {
    nextAction = 'Klicke auf "Verbinden" um Meta zu verbinden';
  } else if (!AppState.selectedBrand) {
    nextAction = 'Wähle eine Brand aus';
  } else {
    nextAction = 'Bereit! Navigiere zu einem Modul';
  }
  
  welcomeView.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem;
      text-align: center;
    ">
      <!-- Logo -->
      <div style="
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #4F80FF 0%, #3B5CFF 100%);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
        box-shadow: 0 8px 24px rgba(79, 128, 255, 0.25);
      ">
        <span style="font-size: 48px;">📊</span>
      </div>
      
      <!-- Heading -->
      <h1 style="
        font-size: 2rem;
        font-weight: 700;
        color: #1F2937;
        margin-bottom: 0.5rem;
      ">
        ${isDemo ? 'Demo Mode' : 'Live Mode'}
      </h1>
      
      <p style="
        font-size: 1rem;
        color: #6B7280;
        margin-bottom: 3rem;
        max-width: 500px;
      ">
        Willkommen bei SignalOne. Wähle Kanal und Brand, um mit der Analyse zu starten.
      </p>
      
      <!-- Status Checklist -->
      <div style="
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 16px;
        padding: 2rem;
        max-width: 400px;
        width: 100%;
        text-align: left;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      ">
        <h3 style="
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6B7280;
          margin-bottom: 1.5rem;
          letter-spacing: 0.05em;
        ">Setup-Status</h3>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 24px;">${channelStatus}</span>
            <div>
              <div style="font-weight: 500; color: #1F2937;">Kanal auswählen</div>
              <div style="font-size: 0.875rem; color: #6B7280;">
                ${hasChannel ? `${AppState.selectedChannel.toUpperCase()} gewählt` : 'Noch nicht gewählt'}
              </div>
            </div>
          </div>
          
          ${!isDemo ? `
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 24px;">${connectionStatus}</span>
            <div>
              <div style="font-weight: 500; color: #1F2937;">Meta verbinden</div>
              <div style="font-size: 0.875rem; color: #6B7280;">
                ${hasConnection ? 'Erfolgreich verbunden' : 'Nicht verbunden'}
              </div>
            </div>
          </div>
          ` : ''}
          
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 24px;">${brandStatus}</span>
            <div>
              <div style="font-weight: 500; color: #1F2937;">Brand wählen</div>
              <div style="font-size: 0.875rem; color: #6B7280;">
                ${AppState.selectedBrand ? AppState.selectedBrand.name : 'Noch nicht gewählt'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Next Action -->
      <div style="
        margin-top: 2rem;
        padding: 1rem 1.5rem;
        background: #F3F4F6;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      ">
        <span style="font-size: 18px;">👉</span>
        <span style="font-weight: 500; color: #4B5563;">${nextAction}</span>
      </div>
    </div>
  `;
}

// ===================================
// MODULE LOADING - CRITICAL FIX + CACHE BUSTING
// ===================================

async function loadModule(moduleId) {
  const viewId = `${moduleId}View`;
  const container = document.getElementById(viewId);
  
  if (!container) {
    console.error('[LoadModule] Container not found:', viewId);
    showToast('Modul konnte nicht geladen werden', 'error');
    return;
  }
  
  showView(viewId);
  currentModuleId = moduleId;
  
  // CRITICAL FIX: Destroy old module BEFORE creating new context
  if (currentModule && typeof currentModule.destroy === 'function') {
    try {
      currentModule.destroy(container);
      currentModule = null;
    } catch (e) {
      console.warn('[LoadModule] Destroy failed:', e);
    }
  }
  
  container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Sensei analysiert Daten...</div>';
  
  try {
    const loader = MODULE_LOADERS[moduleId];
    if (!loader) {
      throw new Error(`Module loader not found: ${moduleId}`);
    }
    
    showGlobalLoader('Sensei analysiert Daten...');
    
    console.log(`[LoadModule] Loading ${moduleId} with cache version:`, CACHE_VERSION);
    
    const module = await loader();
    currentModule = module;

    // CRITICAL FIX: Context wird HIER NEU erstellt mit aktuellem AppState!
    const ctx = createModuleContext();
    
    console.log('[LoadModule] Context created with:', {
      brand: ctx.appState.selectedBrand?.name,
      campaign: ctx.appState.selectedCampaign?.name,
      range: ctx.appState.settings?.range,
      cacheVersion: CACHE_VERSION
    });

    if (typeof module.load === 'function') {
      await module.load(ctx);
    }

    if (typeof module.render === 'function') {
      await module.render(container, ctx);
    } else {
      container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Modul hat keine render() Funktion.</div>';
      hideGlobalLoader();
      return;
    }

    if (typeof module.mount === 'function') {
      module.mount(container, ctx);
    }
    
    hideGlobalLoader();
    console.log(`✅ Module ${moduleId} loaded successfully (v${CACHE_VERSION})`);
    
  } catch (error) {
    console.error('[LoadModule] Error:', error);
    hideGlobalLoader();
    
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.25rem; color: #ef4444; margin-bottom: 1rem;">Modul konnte nicht geladen werden</h2>
        <p style="color: #6b7280; margin-bottom: 2rem;">${error.message || 'Unbekannter Fehler'}</p>
        <button id="retryModule" style="
          background: #4F80FF;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">Erneut versuchen</button>
      </div>
    `;
    
    const retryBtn = container.querySelector('#retryModule');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => loadModule(moduleId));
    }
  }
}

function reloadCurrentModule() {
  if (currentModuleId) {
    console.log('[ReloadModule]', currentModuleId, 'with range:', AppState.settings?.range);
    loadModule(currentModuleId);
  } else {
    console.log('[ReloadModule] No module to reload');
  }
}

// ===================================
// TOPBAR DROPDOWNS (GLOBAL SYNC)
// ===================================

function initChannelSelect() {
  try {
    const channelSelect = document.getElementById('channelSelect');
    const brandSelect = document.getElementById('brandSelect');
    const campaignSelect = document.getElementById('campaignSelect');
    
    if (!channelSelect) {
      console.warn('[ChannelSelect] Element not found');
      return;
    }
    
    channelSelect.addEventListener('change', async (e) => {
      const channel = e.target.value;
      
      updateState({ selectedChannel: channel });
      
      if (!channel) {
        updateState({ 
          selectedBrand: null, 
          selectedCampaign: null,
          dataModeStatus: 'yellow'
        });
        
        if (brandSelect) {
          brandSelect.innerHTML = '<option value="">Erst Kanal wählen...</option>';
          brandSelect.disabled = true;
        }
        if (campaignSelect) {
          campaignSelect.innerHTML = '<option value="">Erst Brand wählen...</option>';
          campaignSelect.disabled = true;
        }
        
        showWelcomeScreen();
        return;
      }
      
      if (brandSelect) {
        brandSelect.disabled = false;
      }
      
      showToast(`Kanal gewählt: ${channel.toUpperCase()}`, 'info');
      
      if (AppState.mode === 'demo') {
        await initBrandSelect();
      } else {
        showToast('Bitte auf "Verbinden" klicken', 'info');
      }
      
      // Update welcome screen to reflect channel selection
      if (currentModuleId === null || AppState.currentView === 'welcome') {
        updateWelcomeScreenContent();
      }
    });
  } catch (error) {
    console.error('[ChannelSelect] Init error:', error);
  }
}

async function initBrandSelect() {
  try {
    const brandSelect = document.getElementById('brandSelect');
    if (!brandSelect) {
      console.warn('[BrandSelect] Element not found');
      return;
    }
    
    if (!AppState.selectedChannel) {
      brandSelect.innerHTML = '<option value="">Erst Kanal wählen...</option>';
      brandSelect.disabled = true;
      return;
    }
    
    const brands = await DataLayer.fetchBrands();
    
    if (!brands || brands.length === 0) {
      brandSelect.innerHTML = '<option value="">Keine Brands verfügbar</option>';
      brandSelect.disabled = true;
      return;
    }
    
    brandSelect.innerHTML = '<option value="">Wähle Brand...</option>';
    brandSelect.disabled = false;
    
    brands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand?.id || '';
      option.textContent = brand?.name || 'Unbekannte Brand';
      brandSelect.appendChild(option);
    });
    
    if (AppState.selectedBrand?.id) {
      brandSelect.value = AppState.selectedBrand.id;
    }
    
    brandSelect.removeEventListener('change', handleBrandChange);
    brandSelect.addEventListener('change', handleBrandChange);
    
  } catch (error) {
    console.error('[BrandSelect] Error:', error);
    showToast('Fehler beim Laden der Brands', 'error');
  }
}

async function handleBrandChange(e) {
  try {
    const brandId = e.target.value;
    
    console.log('[BrandChange] Selected:', brandId);
    
    if (!brandId) {
      updateState({ 
        selectedBrand: null, 
        selectedCampaign: null,
        dataModeStatus: 'yellow'
      });
      showWelcomeScreen();
      return;
    }
    
    const brands = await DataLayer.fetchBrands();
    const brand = brands.find(b => b?.id === brandId);
    
    if (!brand) {
      console.warn('[BrandChange] Brand not found:', brandId);
      showToast('Brand nicht gefunden', 'error');
      return;
    }
    
    updateState({ 
      selectedBrand: brand,
      selectedCampaign: null,
      dataModeStatus: 'green'
    });
    
    console.log('[BrandChange] AppState updated:', AppState.selectedBrand?.name);
    
    showToast(`Brand gewählt: ${brand.name}`, 'success');
    
    await initCampaignSelect();
    updateStatusDots();
    
    // CRITICAL FIX: Reload module AFTER AppState update
    if (currentModuleId && currentModuleId !== 'welcome') {
      console.log('[BrandChange] Reloading module:', currentModuleId);
      reloadCurrentModule();
    } else {
      console.log('[BrandChange] Loading dashboard');
      navigateTo('dashboard');
    }
  } catch (error) {
    console.error('[BrandChange] Error:', error);
    showToast('Brand-Wechsel fehlgeschlagen', 'error');
  }
}

async function initCampaignSelect() {
  try {
    const campaignSelect = document.getElementById('campaignSelect');
    if (!campaignSelect) {
      console.warn('[CampaignSelect] Element not found');
      return;
    }
    
    if (!AppState.selectedBrand) {
      campaignSelect.innerHTML = '<option value="">Erst Brand wählen...</option>';
      campaignSelect.disabled = true;
      return;
    }
    
    const campaigns = await DataLayer.fetchCampaigns(
      AppState.selectedBrand,
      null
    );
    
    if (!campaigns || campaigns.length === 0) {
      campaignSelect.innerHTML = '<option value="">Keine Kampagnen verfügbar</option>';
      campaignSelect.disabled = false;
      return;
    }
    
    campaignSelect.innerHTML = '<option value="">Alle Kampagnen</option>';
    campaignSelect.disabled = false;
    
    campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign?.id || '';
      option.textContent = campaign?.name || 'Unbekannte Kampagne';
      campaignSelect.appendChild(option);
    });
    
    if (AppState.selectedCampaign?.id) {
      campaignSelect.value = AppState.selectedCampaign.id;
    }
    
    campaignSelect.removeEventListener('change', handleCampaignChange);
    campaignSelect.addEventListener('change', handleCampaignChange);
    
  } catch (error) {
    console.error('[CampaignSelect] Error:', error);
  }
}

async function handleCampaignChange(e) {
  try {
    const campaignId = e.target.value;
    
    console.log('[CampaignChange] Selected:', campaignId);
    
    if (!campaignId) {
      updateState({ selectedCampaign: null });
      showToast('Filter: Alle Kampagnen', 'info');
    } else {
      const campaigns = await DataLayer.fetchCampaigns(AppState.selectedBrand, null);
      const campaign = campaigns.find(c => c?.id === campaignId);
      
      if (!campaign) {
        console.warn('[CampaignChange] Campaign not found:', campaignId);
        return;
      }
      
      updateState({ selectedCampaign: campaign });
      console.log('[CampaignChange] AppState updated:', AppState.selectedCampaign?.name);
      showToast(`Kampagne gewählt: ${campaign.name}`, 'info');
    }
    
    // CRITICAL FIX: Reload module AFTER AppState update
    if (currentModuleId) {
      console.log('[CampaignChange] Reloading module:', currentModuleId);
      reloadCurrentModule();
    }
  } catch (error) {
    console.error('[CampaignChange] Error:', error);
  }
}

// ===================================
// META CONNECT
// ===================================

function initMetaConnect() {
  try {
    const metaBtn = document.getElementById('metaConnectButton');
    if (!metaBtn) {
      console.warn('[MetaConnect] Button not found');
      return;
    }
    
    metaBtn.addEventListener('click', async () => {
      if (!AppState.selectedChannel) {
        showToast('Bitte erst einen Kanal auswählen', 'warning');
        return;
      }
      
      if (AppState.metaConnected) {
        updateState({ 
          metaConnected: false, 
          metaToken: null,
          selectedBrand: null,
          selectedCampaign: null,
          dataModeStatus: 'yellow'
        });
        showToast(`${AppState.selectedChannel.toUpperCase()} getrennt`, 'info');
        metaBtn.innerHTML = '<span>🔗</span><span>Verbinden</span>';
        updateStatusDots();
        showWelcomeScreen();
      } else {
        showGlobalLoader(`Verbinde ${AppState.selectedChannel.toUpperCase()}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        hideGlobalLoader();
        
        updateState({ 
          metaConnected: true, 
          metaToken: 'live-token-' + Date.now(),
          dataModeStatus: 'yellow'
        });
        
        showToast(`${AppState.selectedChannel.toUpperCase()} erfolgreich verbunden!`, 'success');
        metaBtn.innerHTML = '<span>✅</span><span>Verbunden</span>';
        
        updateStatusDots();
        await initBrandSelect();
        
        // Update welcome screen to reflect connection
        if (currentModuleId === null || AppState.currentView === 'welcome') {
          updateWelcomeScreenContent();
        }
      }
    });
  } catch (error) {
    console.error('[MetaConnect] Init error:', error);
  }
}

// ===================================
// STATUS DOTS
// ===================================

function updateStatusDots() {
  try {
    const systemDot = document.getElementById('sidebarSystemDot');
    const performanceDot = document.getElementById('sidebarPerformanceDot');
    const modeDot = document.getElementById('sidebarModeDot');
    
    if (systemDot) {
      systemDot.className = `status-dot status-dot-${AppState.systemStatus || 'yellow'}`;
    }
    
    if (performanceDot) {
      performanceDot.className = `status-dot status-dot-${AppState.performanceStatus || 'yellow'}`;
    }
    
    if (modeDot) {
      let status = 'red';
      
      if (AppState.mode === 'demo') {
        status = AppState.selectedBrand ? 'green' : 'yellow';
      } else {
        if (AppState.metaConnected && AppState.selectedBrand) {
          status = 'green';
        } else if (AppState.metaConnected) {
          status = 'yellow';
        } else {
          status = 'red';
        }
      }
      
      modeDot.className = `status-dot status-dot-${status}`;
    }
  } catch (error) {
    console.error('[StatusDots] Update error:', error);
  }
}

// ===================================
// TOPBAR
// ===================================

function updateTopbarGreeting() {
  try {
    const greetingEl = document.getElementById('topbarGreeting');
    if (!greetingEl) return;
    
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
    greetingEl.textContent = greeting;
  } catch (error) {
    console.error('[Topbar] Greeting error:', error);
  }
}

function updateTopbarDateTime() {
  try {
    const dateEl = document.getElementById('topbarDate');
    if (!dateEl) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    dateEl.textContent = dateStr;
  } catch (error) {
    console.error('[Topbar] DateTime error:', error);
  }
}

function initTopbarActions() {
  try {
    const notificationsBtn = document.getElementById('notificationsButton');
    const profileBtn = document.getElementById('profileButton');
    const logoutBtn = document.getElementById('logoutButton');
    const settingsBtn = document.getElementById('settingsButton');
    
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        showToast('Benachrichtigungen: Keine neuen Nachrichten', 'info');
      });
    }
    
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        showToast('Profil: Coming Soon', 'info');
      });
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Wirklich ausloggen?')) {
          resetState();
          window.location.reload();
        }
      });
    }
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        navigateTo('settings');
      });
    }
  } catch (error) {
    console.error('[TopbarActions] Init error:', error);
  }
}

// ===================================
// UI HELPERS
// ===================================

let toastTimeout = null;

function showToast(message, type = 'info') {
  try {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    container.innerHTML = '';
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} visible`;
    toast.textContent = message || 'Aktion ausgeführt';
    container.appendChild(toast);
    
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  } catch (error) {
    console.error('[Toast] Error:', error);
  }
}

function showGlobalLoader(message = 'Sensei analysiert Daten...') {
  try {
    const loader = document.getElementById('globalLoader');
    const label = document.getElementById('globalLoaderLabel');
    if (loader) loader.classList.add('is-active');
    if (label) label.textContent = message;
  } catch (error) {
    console.error('[Loader] Show error:', error);
  }
}

function hideGlobalLoader() {
  try {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.remove('is-active');
  } catch (error) {
    console.error('[Loader] Hide error:', error);
  }
}

function openModal(title, bodyHtml) {
  try {
    const overlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('modalCloseButton');
    
    if (!overlay) return;
    
    if (modalTitle) modalTitle.textContent = title || 'Sensei Analyse';
    if (modalBody) modalBody.innerHTML = bodyHtml || '<p>Keine Daten verfügbar</p>';
    
    overlay.classList.add('is-active');
    
    if (closeBtn) {
      closeBtn.onclick = () => overlay.classList.remove('is-active');
    }
    
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.classList.remove('is-active');
    };
  } catch (error) {
    console.error('[Modal] Open error:', error);
  }
}

function closeModal() {
  try {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('is-active');
  } catch (error) {
    console.error('[Modal] Close error:', error);
  }
}

// ===================================
// EVENT LISTENERS
// ===================================

window.addEventListener('appStateChange', (event) => {
  updateStatusDots();
});

window.addEventListener('reloadAllModules', () => {
  reloadCurrentModule();
});

window.addEventListener('navigateTo', (event) => {
  navigateTo(event.detail);
});

window.addEventListener('showToast', (event) => {
  const detail = event.detail || {};
  showToast(detail.message, detail.type);
});

// ===================================
// GLOBAL API
// ===================================

window.SignalOne = {
  AppState,
  DataLayer,
  showToast,
  showGlobalLoader,
  hideGlobalLoader,
  openModal,
  closeModal,
  navigateTo,
  reloadCurrentModule,
  updateStatusDots,
  CACHE_VERSION // Expose cache version for debugging
};

// ===================================
// INIT
// ===================================

async function initApp() {
  try {
    console.log('🚀 SignalOne - Initializing...');
    console.log('🔥 Cache Version:', CACHE_VERSION);
    console.log('📍 Mode:', AppState.mode);
    console.log('⏱️ Range:', AppState.settings?.range);
    
    buildSidebar();
    updateTopbarGreeting();
    updateTopbarDateTime();
    updateStatusDots();
    
    initChannelSelect();
    initMetaConnect();
    initTopbarActions();
    
    showWelcomeScreen();
    
    setInterval(() => {
      updateTopbarDateTime();
    }, 30000);
    
    console.log('✅ SignalOne - Ready!');
  } catch (error) {
    console.error('[Init] Fatal error:', error);
    showToast('Initialisierung fehlgeschlagen', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initApp);