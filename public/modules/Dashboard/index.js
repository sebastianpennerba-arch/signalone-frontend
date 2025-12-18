/**
 * Dashboard Module with TimeRange Support
 * 
 * Features:
 * - 24h / 7d / 30d TimeRange Switcher
 * - Real-time API integration
 * - Auto-reload on range change
 * - Brand & Campaign filtering
 */

export const meta = {
  id: 'dashboard',
  label: 'Dashboard',
  requiresData: true
};

let ctx = null;
let currentRange = '7d'; // Default
let currentBrand = null;
let currentCampaign = null;
let dashboardData = null;

// Get app state
function getAppState() {
  return (window.SignalOne && window.SignalOne.AppState) 
    ? window.SignalOne.AppState 
    : (ctx?.appState || {});
}

// Show toast
function toast(message, type = 'info') {
  if (window.SignalOne?.showToast) {
    window.SignalOne.showToast(message, type);
  }
}

// Format number with K/M suffix
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}

// Format currency
function formatCurrency(num) {
  return '€' + formatNumber(num);
}

// Fetch dashboard data from API
async function fetchDashboardData(brandId, campaignId = null, range = '7d') {
  try {
    const appState = getAppState();
    const mode = appState.mode || 'demo';
    
    let url = `https://api.signalone.cloud/api/demo/dashboard?brandId=${brandId}&range=${range}`;
    if (campaignId) {
      url += `&campaignId=${campaignId}`;
    }
    
    console.log('[Dashboard] Fetching:', url);
    
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Failed to fetch dashboard data');
    }
    
    return result.data;
  } catch (error) {
    console.error('[Dashboard] Error:', error);
    toast('Fehler beim Laden der Dashboard-Daten', 'error');
    return null;
  }
}

// Render TimeRange Dropdown
function renderTimeRangeDropdown(container) {
  const dropdown = container.querySelector('.timerange-dropdown');
  if (!dropdown) return;
  
  const labels = {
    '24h': '24 Stunden',
    '7d': '7 Tage',
    '30d': '30 Tage'
  };
  
  dropdown.innerHTML = `
    <select class="timerange-select" style="
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
      padding: 8px 32px 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      appearance: none;
      background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 20px;
    ">
      <option value="24h" ${currentRange === '24h' ? 'selected' : ''}>${labels['24h']}</option>
      <option value="7d" ${currentRange === '7d' ? 'selected' : ''}>${labels['7d']}</option>
      <option value="30d" ${currentRange === '30d' ? 'selected' : ''}>${labels['30d']}</option>
    </select>
  `;
  
  const select = dropdown.querySelector('.timerange-select');
  select.addEventListener('change', async (e) => {
    const newRange = e.target.value;
    if (newRange === currentRange) return;
    
    currentRange = newRange;
    toast(`Zeitraum geändert: ${labels[newRange]}`, 'info');
    
    // Reload dashboard data
    await loadDashboard(container);
  });
}

// Render Dashboard
async function loadDashboard(container) {
  const appState = getAppState();
  
  // Get current brand and campaign from app state
  currentBrand = appState.selectedBrand || null;
  currentCampaign = appState.selectedCampaign || null;
  
  if (!currentBrand) {
    container.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #888;">
        <h2 style="color: #fff; margin-bottom: 16px;">Noch keine Daten für Dashboard</h2>
        <p>Wähle eine Brand mit Demo-Daten aus dem Header.</p>
      </div>
    `;
    return;
  }
  
  // Show loading
  container.innerHTML = `
    <div style="padding: 60px 20px; text-align: center;">
      <div style="color: #888;">Lade Dashboard-Daten...</div>
    </div>
  `;
  
  // Fetch data
  dashboardData = await fetchDashboardData(
    currentBrand.id,
    currentCampaign?.id || null,
    currentRange
  );
  
  if (!dashboardData) {
    container.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #888;">
        <h2 style="color: #fff; margin-bottom: 16px;">Keine Daten verfügbar</h2>
        <p>Für diese Brand sind keine Dashboard-Daten vorhanden.</p>
      </div>
    `;
    return;
  }
  
  // Render dashboard
  container.innerHTML = `
    <div class="dashboard-container" style="padding: 24px;">
      
      <!-- Header with TimeRange -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
        <h1 style="color: #fff; font-size: 28px; margin: 0;">
          ${currentBrand.name} ${currentCampaign ? '- ' + currentCampaign.name : ''}
        </h1>
        <div class="timerange-dropdown"></div>
      </div>
      
      <!-- KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px;">
        
        <!-- Spend -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px;">
          <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">SPEND</div>
          <div style="color: #fff; font-size: 32px; font-weight: 700;">${formatCurrency(dashboardData.spend)}</div>
        </div>
        
        <!-- Revenue -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px; border-radius: 12px;">
          <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">REVENUE</div>
          <div style="color: #fff; font-size: 32px; font-weight: 700;">${formatCurrency(dashboardData.revenue)}</div>
        </div>
        
        <!-- ROAS -->
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 24px; border-radius: 12px;">
          <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">ROAS</div>
          <div style="color: #fff; font-size: 32px; font-weight: 700;">${dashboardData.roas.toFixed(1)}x</div>
        </div>
        
        <!-- Conversions -->
        <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 24px; border-radius: 12px;">
          <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">CONVERSIONS</div>
          <div style="color: #fff; font-size: 32px; font-weight: 700;">${formatNumber(dashboardData.conversions)}</div>
        </div>
        
      </div>
      
      <!-- Info Message -->
      <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="color: #888; font-size: 14px;">✨ Zeitraum: <strong style="color: #fff;">${currentRange === '24h' ? '24 Stunden' : currentRange === '7d' ? '7 Tage' : '30 Tage'}</strong></div>
        <div style="color: #666; font-size: 13px; margin-top: 8px;">Weitere Dashboard-Features (Charts, Top Performers) werden in der nächsten Version verfügbar sein.</div>
      </div>
      
    </div>
  `;
  
  // Render TimeRange dropdown
  renderTimeRangeDropdown(container);
}

// Main render function
export async function render(container, context) {
  ctx = context || ctx;
  
  await loadDashboard(container);
  
  // Listen for brand/campaign changes
  window.addEventListener('appStateChanged', async () => {
    await loadDashboard(container);
  });
}
