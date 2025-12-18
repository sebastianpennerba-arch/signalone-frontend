/**
 * SignalOne - Dashboard V14 MODULE-LEVEL TIME RANGE
 * 
 * 🎯 NEW: Time Range Dropdown in Module Header
 * 🔥 Time Range Support (30d/7d/24h)
 * 🐛 Image Error Loop FIX
 * 📊 ROAS Data Parsing FIX
 * 🔄 Flicker Prevention FIX
 */

import * as DataLayer from '../../data/index.js';
import { calculateSenseiScore } from '../../shared/senseiScore.js';
import { createTimeRangeSelect, loadTimeRangeSelectCSS } from '../../shared/timeRangeSelect.js';

export const meta = {
  id: 'dashboard',
  label: 'Dashboard',
  requiresData: true
};

let moduleData = null;
let currentCtx = null;

export async function render(container, ctx) {
  if (!container) return;
  
  currentCtx = ctx;
  
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #64748B;">Dashboard lädt...</div>';
    
    loadModuleCSS();
    loadTimeRangeSelectCSS();
    
    const state = ctx?.appState || {};
    const timeRange = state.settings?.range || '7d';
    
    console.log('[Dashboard] Rendering with range:', timeRange);
    
    // 🔥 CRITICAL: Pass { range } options to DataLayer
    const options = { range: timeRange };
    
    const [dashboardData, creatives, campaigns] = await Promise.all([
      DataLayer.fetchDashboardData(state.selectedBrand, null, state.selectedCampaign, options).catch(() => null),
      DataLayer.fetchCreatives(state.selectedBrand, null, state.selectedCampaign, options).catch(() => []),
      DataLayer.fetchCampaigns(state.selectedBrand, null, options).catch(() => [])
    ]);
    
    if (!dashboardData || !creatives || creatives.length === 0) {
      container.innerHTML = renderEmptyState(state);
      return;
    }
    
    const senseiScoreData = calculateSenseiScore(dashboardData, {
      roas: dashboardData.roas,
      spend: dashboardData.spend,
      ctr: dashboardData.ctr || 0,
      cpm: dashboardData.cpm || 0,
      frequency: dashboardData.frequency || 0
    });
    
    moduleData = { dashboard: dashboardData, creatives, campaigns, sensei: senseiScoreData, range: timeRange };
    
    container.innerHTML = renderDashboard(dashboardData, creatives, campaigns, senseiScoreData, state, timeRange);
    
    // 🎯 NEW: Inject Time Range Dropdown into Header
    mountTimeRangeDropdown(container, timeRange);
    
    bindEvents(container);
    
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.25rem; color: #ef4444; margin-bottom: 1rem;">Dashboard Fehler</h2>
        <p style="color: #64748B; margin-bottom: 2rem;">${error?.message || 'Unbekannter Fehler'}</p>
        <button id="retryDashboard" style="
          background: #0EA5E9;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        ">Erneut versuchen</button>
      </div>
    `;
    
    const retryBtn = container.querySelector('#retryDashboard');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => render(container, ctx));
    }
  }
}

export async function destroy(container) {
  if (container) {
    container.innerHTML = '';
  }
  unloadModuleCSS();
  moduleData = null;
  currentCtx = null;
}

// 🎯 NEW: Mount Time Range Dropdown
function mountTimeRangeDropdown(container, currentRange) {
  const headerRight = container.querySelector('.dash-header-right');
  if (!headerRight) {
    console.warn('[Dashboard] Header right not found for time range dropdown');
    return;
  }
  
  const dropdown = createTimeRangeSelect({
    currentRange,
    onChange: (newRange) => {
      console.log('[Dashboard] Time range changed to:', newRange);
      
      // Update AppState
      if (window.SignalOne && window.SignalOne.AppState) {
        const updatedSettings = { ...window.SignalOne.AppState.settings, range: newRange };
        window.SignalOne.AppState.settings = updatedSettings;
      }
      
      // Show toast
      const rangeLabels = { '30d': '30 Tage', '7d': '7 Tage', '24h': '24 Stunden' };
      if (window.SignalOne?.showToast) {
        window.SignalOne.showToast(`Zeitraum: ${rangeLabels[newRange]}`, 'info');
      }
      
      // Reload module
      if (window.SignalOne?.reloadCurrentModule) {
        window.SignalOne.reloadCurrentModule();
      }
    }
  });
  
  headerRight.appendChild(dropdown);
}

function renderEmptyState(state) {
  const brandName = state?.selectedBrand?.name || 'Brand';
  const mode = state?.mode === 'live' ? 'LIVE' : 'DEMO';
  
  return `
    <div style="
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 3rem;
      text-align: center;
    ">
      <div style="font-size: 3rem; margin-bottom: 1.5rem; color: #CBD5E1;">—</div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: #0F172A; margin-bottom: 1rem;">
        Noch keine Daten für ${brandName}
      </h2>
      <p style="color: #64748B; font-size: 0.9375rem; max-width: 500px; line-height: 1.6;">
        ${mode === 'DEMO' ? 'Wähle eine Brand mit Demo-Daten aus dem Header.' : 'Meta-Konto verbinden und Daten synchronisieren.'}
      </p>
    </div>
  `;
}

function renderDashboard(data, creatives, campaigns, senseiScore, state, timeRange) {
  const brandName = state?.selectedBrand?.name || 'Brand';
  const campaignName = state?.selectedCampaign?.name || 'Alle Kampagnen';
  const mode = state?.mode === 'live' ? 'LIVE' : 'DEMO';
  
  // 🔥 FIX: Stable sort to prevent flicker
  const topPerformers = [...creatives]
    .map(c => ({ ...c, roasNum: parseFloat(c.roas) || 0 }))
    .sort((a, b) => b.roasNum - a.roasNum)
    .slice(0, 6);
  
  const loserAds = creatives.filter(c => (parseFloat(c.roas) || 0) < 2.5 && c?.status !== 'paused');
  const winnerAds = creatives.filter(c => (parseFloat(c.roas) || 0) >= 5.0 && c?.status === 'active');
  
  const spendTrend = parseFloat(data?.trend?.spend) || 0;
  const revenueTrend = parseFloat(data?.trend?.revenue) || 0;
  const roasTrend = parseFloat(data?.trend?.roas) || 0;
  
  const quickWins = generateQuickWins(data, loserAds, winnerAds, senseiScore);
  
  return `
    <div class="dashboard-elite-mono">
      
      <div class="dash-header">
        <div class="header-left">
          <h1 class="header-title">${brandName}</h1>
          <div class="header-meta">
            <span class="meta-item">${mode}</span>
            <span class="meta-dot">•</span>
            <span class="meta-item">${campaignName}</span>
          </div>
        </div>
        
        <!-- 🎯 NEW: Time Range Dropdown Container -->
        <div class="dash-header-right"></div>
      </div>
      
      ${quickWins.length > 0 ? `
        <div class="quick-wins-grid">
          ${quickWins.map((win, i) => `
            <div class="quick-win-card">
              <div class="quick-win-number">${i + 1}</div>
              <div class="quick-win-content">
                <div class="quick-win-title">${win.title}</div>
                <div class="quick-win-desc">${win.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="dash-main-grid">
        
        <div class="dash-sidebar">
          <div class="sensei-elite" data-action="openSensei">
            <div class="sensei-top">
              <div class="sensei-label">SENSEI SCORE</div>
            </div>
            <div class="sensei-score-display">${senseiScore.score}</div>
            <div class="sensei-status">${senseiScore.label.toUpperCase()}</div>
            <div class="sensei-bar">
              <div class="sensei-bar-fill" style="width: ${senseiScore.score}%;"></div>
            </div>
            <p class="sensei-text">${getSenseiExplanation(senseiScore.score)}</p>
          </div>
        </div>
        
        <div class="dash-content">
          
          <div class="kpi-grid-clean">
            ${renderKPIClean('Spend', formatCurrency(data?.spend), spendTrend)}
            ${renderKPIClean('Revenue', formatCurrency(data?.revenue), revenueTrend)}
            ${renderKPIClean('ROAS', formatRoas(data?.roas), roasTrend)}
          </div>
          
          <div class="performers-section">
            <div class="section-header">
              <h3 class="section-title">Top Performers</h3>
              <button class="btn-subtle" data-action="viewAllWinners">View All →</button>
            </div>
            <div class="performers-grid-clean">
              ${topPerformers.length > 0 ? topPerformers.map(creative => renderPerformerClean(creative)).join('') : '<div class="performers-empty">Keine Performers</div>'}
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  `;
}

function renderKPIClean(label, value, trend) {
  const safeTrend = parseFloat(trend) || 0;
  const isPositive = safeTrend > 0;
  const arrow = isPositive ? '↑' : '↓';
  const trendValue = Math.abs(safeTrend).toFixed(1);
  
  return `
    <div class="kpi-card-clean">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-trend ${isPositive ? 'trend-up' : 'trend-down'}">
        ${arrow} ${trendValue}%
      </div>
    </div>
  `;
}

// 🔥 DEADLOCK KILLER - Image Error Loop FIX
function renderPerformerClean(creative) {
  if (!creative) return '';
  
  const safeRoas = parseFloat(creative.roas) || 0;
  const safeRevenue = parseFloat(creative.revenue) || 0;
  const safeCtr = parseFloat(creative.ctr) || 0;
  
  const roasDisplay = formatRoas(safeRoas);
  
  // 💣 BRUTAL FIX: SVG Placeholder inline
  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect fill='%23E2E8F0' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='14' fill='%2394A3B8'%3E${creative.name || 'Creative'}%3C/text%3E%3C/svg%3E`;
  
  let thumbnailUrl = placeholderSVG;
  
  if (creative.thumbnail) {
    if (creative.thumbnail.startsWith('http')) {
      thumbnailUrl = creative.thumbnail;
    } else if (creative.thumbnail.startsWith('/')) {
      thumbnailUrl = creative.thumbnail;
    } else {
      // Try demo-data path
      thumbnailUrl = `/demo-data/creatives/${creative.thumbnail}`;
    }
  }
  
  // 🔥 CRITICAL: Unique ID for error flag
  const imgId = `img-${creative.id || Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <div class="performer-card-clean" data-creative-id="${creative.id || ''}">
      <div class="performer-thumb">
        <img 
          id="${imgId}"
          src="${thumbnailUrl}" 
          alt="${creative.name || 'Creative'}" 
          loading="lazy" 
          onerror="if(!this.dataset.errored){this.dataset.errored='1';this.src='${placeholderSVG}';}"
        />
        <div class="performer-roas-badge">${roasDisplay}</div>
      </div>
      <div class="performer-info">
        <div class="performer-name">${creative.name || 'Unbekannt'}</div>
        <div class="performer-metrics">
          <div class="metric-item">
            <span class="metric-label">Revenue</span>
            <span class="metric-value">${formatCurrency(safeRevenue)}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CTR</span>
            <span class="metric-value">${safeCtr.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateQuickWins(data, loserAds, winnerAds, senseiScore) {
  const wins = [];
  const roas = parseFloat(data?.roas) || 0;
  
  if (loserAds.length > 0) {
    wins.push({
      title: `Pausiere ${loserAds.length} Loser Ads`,
      description: `Diese Ads haben ROAS < 2.5x. Stoppe Budget-Verschwendung.`
    });
  }
  
  if (winnerAds.length > 0 && roas >= 4.0) {
    wins.push({
      title: `Skaliere ${winnerAds.length} Winner Ads`,
      description: `ROAS ≥ 5.0x - erhöhe Budget für mehr Revenue.`
    });
  }
  
  if (wins.length < 2 && roas >= 4.0) {
    wins.push({
      title: 'Performance ist solid',
      description: `ROAS von ${formatRoas(roas)} ist gut. Fokus auf Stabilität.`
    });
  }
  
  return wins.slice(0, 3);
}

function getSenseiExplanation(score) {
  if (score >= 80) return 'Exzellente Performance. Ads laufen hervorragend.';
  if (score >= 60) return 'Solide Performance. Kleine Optimierungen möglich.';
  if (score >= 40) return 'Durchschnittliche Performance. Zeit für Anpassungen.';
  return 'Verbesserungspotenzial vorhanden. Analysiere Loser Ads.';
}

function bindEvents(container) {
  if (!container) return;
  
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAction(btn.dataset.action);
    });
  });
}

function handleAction(action) {
  if (!action) return;
  
  switch (action) {
    case 'openSensei':
      window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'sensei' }));
      break;
    case 'viewAllWinners':
      window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'creativeLibrary' }));
      break;
  }
}

function formatCurrency(value) {
  const safeValue = parseFloat(value) || 0;
  if (safeValue === 0) return '€0';
  return `€${Math.round(safeValue).toLocaleString('de-DE')}`;
}

function formatRoas(value) {
  const safeValue = parseFloat(value) || 0;
  if (safeValue === 0) return '0.0x';
  return `${safeValue.toFixed(1)}x`;
}

function loadModuleCSS() {
  const oldCSS = document.getElementById('dashboard-module-css');
  if (oldCSS) oldCSS.remove();
  
  if (!document.getElementById('dashboard-elite-mono-css')) {
    const link = document.createElement('link');
    link.id = 'dashboard-elite-mono-css';
    link.rel = 'stylesheet';
    link.href = '/packages/dashboard/dashboard-elite-mono.css';
    document.head.appendChild(link);
  }
  
  if (!document.getElementById('sensei-score-css')) {
    const scoreLink = document.createElement('link');
    scoreLink.id = 'sensei-score-css';
    scoreLink.rel = 'stylesheet';
    scoreLink.href = '/shared/senseiScore.css';
    document.head.appendChild(scoreLink);
  }
}

function unloadModuleCSS() {
  const monoCSS = document.getElementById('dashboard-elite-mono-css');
  if (monoCSS) monoCSS.remove();
}