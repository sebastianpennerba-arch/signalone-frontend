/**
 * SignalOne - App.js
 * LIVE-FIRST ARCHITECTURE with CORE API
 * 
 * Core Layer: Kontrolliert State, Dropdowns, Navigation
 * Module Layer: Nutzen Core API, kein direkter Zugriff
 */

import { AppState, updateState, resetState, shouldShowWelcome } from './data/state.js';
import * as DataLayer from './data/index.js';

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
  { id: 'settings', label: 'Settings', icon: '⚙️', requiresData: false },
];

const MODULE_LOADERS = {
  dashboard: () => import('./packages/dashboard/index.js'),
  creativeLibrary: () => import('./packages/creativeLibrary/index.js'),
  campaigns: () => import('./packages/campaigns/index.js'),
  testingLog: () => import('./packages/testingLog/index.js'),
  sensei: () => import('./packages/sensei/index.js'),
  academy: () => import('./packages/academy/index.js'),
  reports: () => import('./packages/reports/index.js'),
  moreTools: () => import('./packages/moreTools/index.js'),
  settings: () => import('./packages/settings/index.js'),
};

let currentModule = null;

// ===================================
// P2: MODULE CONTEXT (Core API for Modules)
// ===================================

function createModuleContext() {
  return {
    appState: AppState,

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
      // Fallback – Sensei UI kommt in P4
      if (window.openModal) {
        const html = `
          <p><strong>${health.label}</strong> – Score ${health.score}</p>
          <p>${health.reasonShort}</p>
          <p style="margin-top:8px;font-size:12px;color:#6b7280;">
            ${health.reasonLong}
          </p>
        `;
        openModal('Sensei Analyse (Demo)', html);
      } else {
        showToast(health.reasonShort || 'Sensei Analyse', 'info');
      }
    }
  };
}

// ===================================
// CORE API EVENT HANDLER
// ===================================

window.addEventListener('coreAction', (event) => {
  const { action, payload } = event.detail;
  
  console.log('[Core] Action received:', action, payload);
  
  switch (action) {
    case 'setMode':
      handleModeChange(payload.mode);
      break;
    default:
      console.warn('[Core] Unknown action:', action);
  }
});

function handleModeChange(newMode) {
  console.log('[Core] Mode change to:', newMode);
  
  // Update state
  updateState({
    mode: newMode,
    selectedChannel: '',
    selectedBrand: null,
    selectedCampaign: null,
    metaConnected: false,
    dataModeStatus: 'yellow'
  });
  
  // Reset UI
  resetDropdowns();
  updateStatusDots();
  showWelcomeScreen();
  
  // Notify modules
  window.dispatchEvent(new CustomEvent('modeChanged', {
    detail: { mode: newMode }
  }));
  
  console.log('✅ Mode changed successfully');
}

function resetDropdowns() {
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
}

// ===================================
// NAVIGATION
// ===================================

function buildSidebar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  
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
}

function navigateTo(moduleId) {
  console.log('[Navigate]', moduleId);
  
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
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('is-active');
  });
  
  const view = document.getElementById(viewId);
  if (view) {
    view.classList.add('is-active');
  }
}

function showWelcomeScreen() {
  showView('welcomeView');
  updateState({ currentView: 'welcome' });
  updateWelcomeScreenContent();
}

function updateWelcomeScreenContent() {
  const welcomeView = document.getElementById('welcomeView');
  if (!welcomeView) return;
  
  if (AppState.mode === 'live') {
    welcomeView.innerHTML = `
      <style>
        .welcome-v2 {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F5F5F7 0%, #E8E8ED 100%);
          padding: 2rem;
        }
        
        .welcome-container {
          max-width: 700px;
          width: 100%;
          text-align: center;
        }
        
        .welcome-hero {
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease;
        }
        
        .welcome-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #4F80FF 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }
        
        .welcome-subtitle {
          font-size: 1.125rem;
          color: #6E6E73;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .welcome-card {
          background: #FFFFFF;
          border: 1px solid #D2D2D7;
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          animation: fadeInUp 0.8s ease 0.2s backwards;
        }
        
        .welcome-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: pulse 2s ease infinite;
        }
        
        .welcome-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1D1D1F;
          margin-bottom: 1.5rem;
        }
        
        .welcome-steps {
          text-align: left;
          background: #F5F5F7;
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .welcome-step {
          display: flex;
          align-items: start;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .welcome-step:hover {
          background: #FFFFFF;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .welcome-step:last-child {
          margin-bottom: 0;
        }
        
        .welcome-step-number {
          min-width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #4F80FF 0%, #8B5CF6 100%);
          color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          margin-right: 1rem;
        }
        
        .welcome-step-text {
          flex: 1;
          color: #1D1D1F;
          font-size: 1rem;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .welcome-step-text strong {
          color: #4F80FF;
        }
        
        .welcome-footer {
          color: #86868B;
          font-size: 0.9375rem;
          animation: fadeInUp 0.8s ease 0.4s backwards;
        }
        
        .welcome-footer-icon {
          font-size: 1.25rem;
          vertical-align: middle;
          margin-right: 0.25rem;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      </style>
      
      <div class="welcome-v2">
        <div class="welcome-container">
          <div class="welcome-hero">
            <h1 class="welcome-title">Willkommen bei SignalOne</h1>
            <p class="welcome-subtitle">
              Verbinde deine Live-Daten und erlebe Performance Marketing auf einem neuen Level.
            </p>
          </div>
          
          <div class="welcome-card">
            <div class="welcome-icon">🚀</div>
            <h2 class="welcome-card-title">So startest du:</h2>
            
            <div class="welcome-steps">
              <div class="welcome-step">
                <div class="welcome-step-number">1</div>
                <div class="welcome-step-text">
                  Wähle oben einen <strong>Kanal</strong> (Meta, Google, TikTok)
                </div>
              </div>
              
              <div class="welcome-step">
                <div class="welcome-step-number">2</div>
                <div class="welcome-step-text">
                  Klicke auf <strong>„Verbinden“</strong> im Header
                </div>
              </div>
              
              <div class="welcome-step">
                <div class="welcome-step-number">3</div>
                <div class="welcome-step-text">
                  Wähle dein <strong>Werbekonto</strong> und optional eine <strong>Kampagne</strong>
                </div>
              </div>
              
              <div class="welcome-step">
                <div class="welcome-step-number">4</div>
                <div class="welcome-step-text">
                  Dashboard wird automatisch geladen 🎉
                </div>
              </div>
            </div>
          </div>
          
          <p class="welcome-footer">
            <span class="welcome-footer-icon">💡</span>
            Demo-Modus? Aktiviere ihn in den <strong>Settings</strong> (unten links in der Sidebar)
          </p>
        </div>
      </div>
    `;
  } else {
    welcomeView.innerHTML = `
      <style>
        .welcome-v2 {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FFF9F0 0%, #FFF3E0 100%);
          padding: 2rem;
        }
        
        .welcome-container {
          max-width: 700px;
          width: 100%;
          text-align: center;
        }
        
        .welcome-hero {
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease;
        }
        
        .welcome-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #FF8A30 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }
        
        .welcome-subtitle {
          font-size: 1.125rem;
          color: #6E6E73;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .welcome-card {
          background: #FFFFFF;
          border: 2px solid #FED7AA;
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(251, 146, 60, 0.15);
          animation: fadeInUp 0.8s ease 0.2s backwards;
        }
        
        .welcome-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: pulse 2s ease infinite;
        }
        
        .welcome-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1D1D1F;
          margin-bottom: 1.5rem;
        }
        
        .welcome-steps {
          text-align: left;
          background: #FFF7ED;
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .welcome-step {
          display: flex;
          align-items: start;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .welcome-step:hover {
          background: #FFFFFF;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(251, 146, 60, 0.1);
        }
        
        .welcome-step:last-child {
          margin-bottom: 0;
        }
        
        .welcome-step-number {
          min-width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FF8A30 0%, #f59e0b 100%);
          color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          margin-right: 1rem;
        }
        
        .welcome-step-text {
          flex: 1;
          color: #1D1D1F;
          font-size: 1rem;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .welcome-step-text strong {
          color: #EA580C;
        }
        
        .welcome-footer {
          color: #86868B;
          font-size: 0.9375rem;
          animation: fadeInUp 0.8s ease 0.4s backwards;
        }
        
        .welcome-footer-icon {
          font-size: 1.25rem;
          vertical-align: middle;
          margin-right: 0.25rem;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      </style>
      
      <div class="welcome-v2">
        <div class="welcome-container">
          <div class="welcome-hero">
            <h1 class="welcome-title">Demo-Modus aktiv</h1>
            <p class="welcome-subtitle">
              Erkunde die Plattform mit realistischen Demo-Daten von 8 verschiedenen Brands.
            </p>
          </div>
          
          <div class="welcome-card">
            <div class="welcome-icon">🎮</div>
            <h2 class="welcome-card-title">Demo-Daten erkunden:</h2>
            
            <div class="welcome-steps">
              <div class="welcome-step">
                <div class="welcome-step-number">1</div>
                <div class="welcome-step-text">
                  Wähle oben einen <strong>Kanal</strong> (Meta, Google, TikTok)
                </div>
              </div>
              
              <div class="welcome-step">
                <div class="welcome-step-number">2</div>
                <div class="welcome-step-text">
                  Wähle eine <strong>Demo-Brand</strong> aus 8 verschiedenen Optionen
                </div>
              </div>
              
              <div class="welcome-step">
                <div class="welcome-step-number">3</div>
                <div class="welcome-step-text">
                  Optional: Wähle eine <strong>Kampagne</strong> für detaillierte Daten
                </div>
              </div>
              
              <div class="welcome-step">
                <div class="welcome-step-number">4</div>
                <div class="welcome-step-text">
                  Dashboard zeigt realistische Performance-Daten 📊
                </div>
              </div>
            </div>
          </div>
          
          <p class="welcome-footer">
            <span class="welcome-footer-icon">🔄</span>
            Zurück zu Live? Deaktiviere Demo-Modus in den <strong>Settings</strong>
          </p>
        </div>
      </div>
    `;
  }
}

// ... [REST OF THE FILE REMAINS EXACTLY THE SAME] ...
// (Continue from "// NAVIGATION" section to end)

// ===================================
// MODULE LOADING  ✅ FIXED (Lifecycle)
// ===================================

async function loadModule(moduleId) {
  const viewId = `${moduleId}View`;
  const container = document.getElementById(viewId);
  
  if (!container) {
    console.error('[LoadModule] Container not found:', viewId);
    return;
  }
  
  showView(viewId);
  
  // teardown previous module
  if (currentModule && currentModule.destroy) {
    try {
      currentModule.destroy(container);
    } catch (e) {
      console.warn('[LoadModule] Destroy failed:', e);
    }
  }
  
  container.innerHTML = '<div style="text-align: center; padding: 4rem;">Lade Modul...</div>';
  
  try {
    const loader = MODULE_LOADERS[moduleId];
    if (!loader) {
      throw new Error(`Module loader not found: ${moduleId}`);
    }
    
    const module = await loader();
    currentModule = module;

    const ctx = createModuleContext();

    // Optional preload hook
    if (module.load) {
      await module.load(ctx);
    }

    // Render: prefer ctx-signature; fallback to legacy AppState signature
    if (module.render) {
      if (module.render.length >= 2) {
        await module.render(container, ctx);
      } else {
        await module.render(container, AppState);
      }
    } else {
      container.innerHTML = '<div style="text-align: center; padding: 4rem;">Modul hat keine render() Funktion.</div>';
      return;
    }

    // Mount: events etc.
    if (module.mount) {
      module.mount(container, ctx);
    }
    
  } catch (error) {
    console.error('[LoadModule] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: #ef4444;">
        <h2>Modul konnte nicht geladen werden</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function reloadCurrentModule() {
  if (AppState.currentView && AppState.currentView !== 'welcome') {
    console.log('[ReloadModule]', AppState.currentView);
    loadModule(AppState.currentView);
  }
}

// ===================================
// TOPBAR DROPDOWNS (GLOBAL SYNC)
// ===================================

function initChannelSelect() {
  const channelSelect = document.getElementById('channelSelect');
  const brandSelect = document.getElementById('brandSelect');
  const campaignSelect = document.getElementById('campaignSelect');
  
  if (!channelSelect) return;
  
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
  });
}

async function initBrandSelect() {
  const brandSelect = document.getElementById('brandSelect');
  if (!brandSelect) return;
  
  if (!AppState.selectedChannel) {
    brandSelect.innerHTML = '<option value="">Erst Kanal wählen...</option>';
    brandSelect.disabled = true;
    return;
  }
  
  try {
    const brands = await DataLayer.fetchBrands();
    
    brandSelect.innerHTML = '<option value="">Wähle Brand...</option>';
    brandSelect.disabled = false;
    
    brands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand.id;
      option.textContent = brand.name;
      brandSelect.appendChild(option);
    });
    
    if (AppState.selectedBrand) {
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
  const brandId = e.target.value;
  
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
  const brand = brands.find(b => b.id === brandId);
  
  updateState({ 
    selectedBrand: brand,
    selectedCampaign: null,
    dataModeStatus: 'green'
  });
  
  showToast(`Brand gewählt: ${brand.name}`, 'success');
  
  await initCampaignSelect();
  updateStatusDots();
  
  if (AppState.currentView === 'welcome') {
    navigateTo('dashboard');
  } else {
    reloadCurrentModule();
  }
}

async function initCampaignSelect() {
  const campaignSelect = document.getElementById('campaignSelect');
  if (!campaignSelect) return;
  
  if (!AppState.selectedBrand) {
    campaignSelect.innerHTML = '<option value="">Erst Brand wählen...</option>';
    campaignSelect.disabled = true;
    return;
  }
  
  try {
    const campaigns = await DataLayer.fetchCampaigns(
      AppState.selectedBrand,
      null
    );
    
    campaignSelect.innerHTML = '<option value="">Alle Kampagnen</option>';
    campaignSelect.disabled = false;
    
    campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign.id;
      option.textContent = campaign.name;
      campaignSelect.appendChild(option);
    });
    
    if (AppState.selectedCampaign) {
      campaignSelect.value = AppState.selectedCampaign.id;
    }
    
    campaignSelect.removeEventListener('change', handleCampaignChange);
    campaignSelect.addEventListener('change', handleCampaignChange);
    
  } catch (error) {
    console.error('[CampaignSelect] Error:', error);
  }
}

async function handleCampaignChange(e) {
  const campaignId = e.target.value;
  
  if (!campaignId) {
    updateState({ selectedCampaign: null });
    showToast('Filter: Alle Kampagnen', 'info');
  } else {
    const campaigns = await DataLayer.fetchCampaigns(AppState.selectedBrand, null);
    const campaign = campaigns.find(c => c.id === campaignId);
    updateState({ selectedCampaign: campaign });
    showToast(`Kampagne gewählt: ${campaign.name}`, 'info');
  }
  
  reloadCurrentModule();
}

// ===================================
// META CONNECT
// ===================================

function initMetaConnect() {
  const metaBtn = document.getElementById('metaConnectButton');
  if (!metaBtn) return;
  
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
    }
  });
}

// ===================================
// STATUS DOTS
// ===================================

function updateStatusDots() {
  const systemDot = document.getElementById('sidebarSystemDot');
  const performanceDot = document.getElementById('sidebarPerformanceDot');
  const modeDot = document.getElementById('sidebarModeDot');
  
  if (systemDot) {
    systemDot.className = `status-dot status-dot-${AppState.systemStatus}`;
  }
  
  if (performanceDot) {
    performanceDot.className = `status-dot status-dot-${AppState.performanceStatus}`;
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
}

// ===================================
// TOPBAR
// ===================================

function updateTopbarGreeting() {
  const greetingEl = document.getElementById('topbarGreeting');
  if (!greetingEl) return;
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  greetingEl.textContent = greeting;
}

function updateTopbarDateTime() {
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
}

function initTopbarActions() {
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
}

// ===================================
// UI HELPERS
// ===================================

let toastTimeout = null;

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  container.innerHTML = '';
  
  const toast = document.createElement('div');
  toast.className = `toast ${type} visible`;
  toast.textContent = message;
  container.appendChild(toast);
  
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showGlobalLoader(message = 'Lade...') {
  const loader = document.getElementById('globalLoader');
  const label = document.getElementById('globalLoaderLabel');
  if (loader) loader.classList.add('is-active');
  if (label) label.textContent = message;
}

function hideGlobalLoader() {
  const loader = document.getElementById('globalLoader');
  if (loader) loader.classList.remove('is-active');
}

function openModal(title, bodyHtml) {
  const overlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalCloseButton');
  
  if (!overlay) return;
  
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = bodyHtml;
  
  overlay.classList.add('is-active');
  
  if (closeBtn) {
    closeBtn.onclick = () => overlay.classList.remove('is-active');
  }
  
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.classList.remove('is-active');
  };
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('is-active');
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
  showToast(event.detail.message, event.detail.type);
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
  updateStatusDots
};

// ===================================
// INIT
// ===================================

async function initApp() {
  console.log('🚀 SignalOne - Initializing (LIVE-FIRST + CORE API)...');
  console.log('📍 Mode:', AppState.mode);
  
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
}

document.addEventListener('DOMContentLoaded', initApp);
