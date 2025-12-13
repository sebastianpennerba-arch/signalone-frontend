/**
 * SignalOne - Dashboard V7.1 ENHANCED VISUAL IMPACT
 * Asymmetric Layout | Color-Coded KPIs | Performance Indicators
 * 
 * FEATURES:
 * - Asymmetric 30/70 Layout
 * - Left Sidebar: Sensei, Actions, Budget, Alerts
 * - Right Main: KPI Bars with Color Coding, Top Performers with Metrics, Critical Actions
 * - Visual Hierarchy with Data-Driven Colors
 * - Elite Design
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'dashboard',
  label: 'Dashboard',
  requiresData: true
};

let moduleData = null;

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Dashboard...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    
    const [dashboardData, creatives, campaigns] = await Promise.all([
      DataLayer.fetchDashboardData(state.selectedBrand, null, state.selectedCampaign),
      DataLayer.fetchCreatives(state.selectedBrand, null, state.selectedCampaign),
      DataLayer.fetchCampaigns(state.selectedBrand, null)
    ]);
    
    if (!dashboardData) {
      throw new Error('Keine Daten verfügbar');
    }
    
    const senseiData = calculateSenseiScore(dashboardData, creatives);
    
    moduleData = { dashboard: dashboardData, creatives, campaigns, sensei: senseiData };
    
    container.innerHTML = renderDashboard(dashboardData, creatives, campaigns, senseiData, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[Dashboard] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.25rem; color: #ef4444; margin-bottom: 1rem;">Dashboard konnte nicht geladen werden</h2>
        <p style="color: #6b7280; margin-bottom: 2rem;">${error.message}</p>
        <button id="retryDashboard" class="btn-retry">Erneut versuchen</button>
      </div>
    `;
    
    const retryBtn = container.querySelector('#retryDashboard');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => render(container));
    }
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
}

function calculateSenseiScore(data, creatives) {
  let score = Math.min(100, (data.roas / 5.0) * 100);
  
  if (data.cpm < 15) score += 5;
  if (data.ctr > 3.0) score += 5;
  
  const loserPercent = (creatives.filter(c => c.roas < 2.5).length / creatives.length) * 100;
  if (loserPercent < 10) score += 5;
  if (loserPercent > 20) score -= 10;
  
  const dailyBudget = 5000;
  const dailySpend = data.spend / 30;
  const budgetPercent = (dailySpend / dailyBudget) * 100;
  if (budgetPercent > 90) score -= 10;
  if (data.ctr < 2.0) score -= 5;
  
  score = Math.round(Math.max(0, Math.min(100, score)));
  
  let status, icon, color, message;
  
  if (score >= 90) {
    status = 'excellent';
    icon = '🏆';
    color = '#D4AF37';
    message = 'Perfektion! Skaliere jetzt!';
  } else if (score >= 75) {
    status = 'healthy';
    icon = '✓';
    color = '#6E6E73';
    message = 'Starke Performance!';
  } else if (score >= 60) {
    status = 'good';
    icon = '●';
    color = '#CD7F32';
    message = 'Solide Basis';
  } else if (score >= 45) {
    status = 'warning';
    icon = '▲';
    color = '#CD7F32';
    message = 'Testing nötig';
  } else {
    status = 'critical';
    icon = '◆';
    color = '#B87333';
    message = 'Sofort optimieren!';
  }
  
  return { score, status, icon, color, message };
}

function getPerformanceLevel(roas) {
  if (roas >= 6.0) return 'excellent';
  if (roas >= 4.0) return 'good';
  return 'average';
}

function getActionSeverity(action) {
  if (action.action === 'pauseLoserAds') return 'critical';
  if (action.action === 'adjustBudget') return 'warning';
  if (action.action === 'scaleWinners') return 'info';
  return 'info';
}

function renderDashboard(data, creatives, campaigns, sensei, state) {
  const brandName = state.selectedBrand?.name || 'Brand';
  const campaignName = state.selectedCampaign?.name || 'All Campaigns';
  const mode = state.mode === 'live' ? 'LIVE' : 'DEMO';
  
  const topPerformers = [...creatives]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 6);
  
  const loserAds = creatives.filter(c => c.roas < 2.5 && c.status !== 'paused');
  
  const dailyBudget = 5000;
  const dailySpend = data.spend / 30;
  const budgetPercent = Math.round((dailySpend / dailyBudget) * 100);
  
  const criticalActions = [];
  
  if (loserAds.length > 0) {
    criticalActions.push({
      icon: '▶',
      color: '#EF4444',
      text: `${loserAds.length} Ads mit ROAS < 2.5 aktiv`,
      action: 'pauseLoserAds'
    });
  }
  
  if (budgetPercent > 85) {
    criticalActions.push({
      icon: '▶',
      color: '#F59E0B',
      text: `Budget zu ${budgetPercent}% verbraucht`,
      action: 'adjustBudget'
    });
  }
  
  const winnerAds = creatives.filter(c => c.roas >= 5.0 && c.status === 'active');
  if (winnerAds.length > 0) {
    criticalActions.push({
      icon: '▶',
      color: '#10B981',
      text: `${winnerAds.length} Winner Ads zum Skalieren bereit`,
      action: 'scaleWinners'
    });
  }
  
  const spendTrend = data.trend?.spend || 0;
  const revenueTrend = data.trend?.revenue || 0;
  const roasTrend = data.trend?.roas || 0;
  
  return `
    <div class="dashboard-v7">
      
      <!-- HEADER -->
      <div class="dashboard-header-v7">
        <div class="header-left-v7">
          <div class="header-brand-v7">${brandName}</div>
          <div class="header-meta-v7">
            <span>${campaignName}</span>
            <span class="meta-divider">•</span>
            <span class="meta-badge-v7">${mode}</span>
          </div>
        </div>
      </div>
      
      <!-- MAIN LAYOUT: SIDEBAR + CONTENT -->
      <div class="dashboard-layout-v7">
        
        <!-- LEFT SIDEBAR -->
        <div class="sidebar-v7">
          
          <!-- SENSEI CARD -->
          <div class="sensei-card-v7" data-status="${sensei.status}" data-action="openSensei">
            <div class="sensei-header-v7">
              <div class="sensei-label-v7">SENSEI SCORE</div>
              <div class="sensei-icon-v7" style="color: ${sensei.color};">${sensei.icon}</div>
            </div>
            <div class="sensei-score-v7" style="color: ${sensei.color};">${sensei.score}</div>
            <div class="sensei-status-v7" style="color: ${sensei.color};">${sensei.status.toUpperCase()}</div>
            <div class="sensei-message-v7">${sensei.message}</div>
            <div class="sensei-bar-v7">
              <div class="sensei-bar-fill-v7" style="width: ${sensei.score}%; background: ${sensei.color};"></div>
            </div>
          </div>
          
          <!-- QUICK ACTIONS -->
          <div class="actions-card-v7">
            <div class="card-title-v7">QUICK ACTIONS</div>
            <button class="action-btn-v7" data-action="pauseLoserAds">Pause Loser Ads</button>
            <button class="action-btn-v7" data-action="scaleWinners">Scale Winners</button>
            <button class="action-btn-v7" data-action="testBudget">Test Budget +20%</button>
          </div>
          
          <!-- BUDGET CIRCLE -->
          <div class="budget-card-v7">
            <div class="card-title-v7">DAILY BUDGET</div>
            <div class="budget-circle-v7">
              <svg class="budget-svg-v7" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#F5F5F7" stroke-width="12"/>
                <circle cx="60" cy="60" r="54" fill="none" stroke="${budgetPercent > 90 ? '#EF4444' : budgetPercent > 75 ? '#F59E0B' : '#6E6E73'}" stroke-width="12"
                  stroke-dasharray="${339.292}" stroke-dashoffset="${339.292 - (339.292 * budgetPercent / 100)}"
                  transform="rotate(-90 60 60)" stroke-linecap="round"/>
              </svg>
              <div class="budget-text-v7">
                <div class="budget-percent-v7">${budgetPercent}%</div>
                <div class="budget-values-v7">${formatCurrency(dailySpend)} / ${formatCurrency(dailyBudget)}</div>
              </div>
            </div>
          </div>
          
          <!-- ALERTS -->
          <div class="alerts-card-v7">
            <div class="card-title-v7">ALERTS (${criticalActions.length})</div>
            ${criticalActions.map(alert => `
              <div class="alert-badge-v7" style="border-color: ${alert.color};">
                <span style="color: ${alert.color};">${alert.icon}</span>
                <span>${alert.text.split(' ')[0]}</span>
              </div>
            `).join('')}
          </div>
          
        </div>
        
        <!-- RIGHT MAIN CONTENT -->
        <div class="main-content-v7">
          
          <!-- KPI BARS (WITH COLOR CODING) -->
          <div class="kpi-bars-v7">
            ${renderKPIBar('Spend', formatCurrency(data.spend), spendTrend, 'spend')}
            ${renderKPIBar('Revenue', formatCurrency(data.revenue), revenueTrend, 'revenue')}
            ${renderKPIBar('ROAS', formatRoas(data.roas), roasTrend, 'roas')}
          </div>
          
          <!-- TOP PERFORMERS (WITH PERFORMANCE INDICATORS) -->
          <div class="performers-section-v7">
            <div class="section-header-v7">
              <div class="section-title-v7">TOP PERFORMERS</div>
              <button class="btn-link-v7" data-action="viewAllWinners">View All →</button>
            </div>
            <div class="performers-grid-v7">
              ${topPerformers.map(creative => renderPerformerCard(creative)).join('')}
            </div>
          </div>
          
          <!-- CRITICAL ACTIONS LIST (WITH SEVERITY LEVELS) -->
          ${criticalActions.length > 0 ? `
            <div class="critical-section-v7">
              <div class="section-header-v7">
                <div class="section-title-v7">CRITICAL ACTIONS</div>
              </div>
              <div class="critical-list-v7">
                ${criticalActions.map(action => `
                  <div class="critical-item-v7" data-action="${action.action}" data-severity="${getActionSeverity(action)}">
                    <span class="critical-icon-v7" style="color: ${action.color};">${action.icon}</span>
                    <span class="critical-text-v7">${action.text}</span>
                    <button class="critical-btn-v7">Action</button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
        </div>
        
      </div>
      
    </div>
  `;
}

function renderKPIBar(label, value, trend, type) {
  const isPositive = trend > 0;
  const arrow = isPositive ? '▲' : '▼';
  const trendClass = getTrendClass(trend, type);
  const trendValue = Math.abs(trend).toFixed(1);
  const barWidth = Math.min(100, Math.abs(trend) * 5);
  
  return `
    <div class="kpi-bar-v7" data-type="${type}">
      <div class="kpi-bar-left-v7">
        <div class="kpi-bar-label-v7">${label}</div>
        <div class="kpi-bar-value-v7">${value}</div>
      </div>
      <div class="kpi-bar-middle-v7">
        <div class="kpi-bar-graph-v7" style="width: ${barWidth}%;"></div>
      </div>
      <div class="kpi-bar-right-v7">
        <span class="kpi-bar-trend-v7 ${trendClass}">${arrow} ${trendValue}%</span>
      </div>
    </div>
  `;
}

function renderPerformerCard(creative) {
  const performancePercent = Math.min(100, (creative.roas / 8.0) * 100);
  const performanceLevel = getPerformanceLevel(creative.roas);
  const roasDisplay = formatRoas(creative.roas);
  
  return `
    <div class="performer-card-v7" data-creative-id="${creative.id}" data-performance="${performanceLevel}">
      <div class="performer-thumb-v7" data-roas="${roasDisplay}">
        <img src="${creative.thumbnail}" alt="${creative.name}" loading="lazy" />
      </div>
      <div class="performer-info-v7">
        <div class="performer-name-v7">${creative.name}</div>
        <div class="performer-metrics-v7">
          <div class="metric-row-v7">
            <span class="metric-label-v7">ROAS</span>
            <span class="metric-value-v7">${roasDisplay}</span>
          </div>
          <div class="metric-row-v7">
            <span class="metric-label-v7">Revenue</span>
            <span class="metric-value-v7">${formatCurrency(creative.revenue)}</span>
          </div>
          <div class="metric-row-v7">
            <span class="metric-label-v7">CTR</span>
            <span class="metric-value-v7">${creative.ctr.toFixed(2)}%</span>
          </div>
          <div class="metric-row-v7">
            <span class="metric-label-v7">CPM</span>
            <span class="metric-value-v7">${formatCurrency(creative.cpm)}</span>
          </div>
        </div>
        <div class="performer-bar-v7">
          <div class="performer-bar-fill-v7" style="width: ${performancePercent}%;"></div>
        </div>
        <div class="performer-actions-v7">
          <button class="performer-btn-v7 btn-scale" data-action="scaleAd" data-id="${creative.id}">Scale</button>
          <button class="performer-btn-v7 btn-analyze" data-action="analyzeAd" data-id="${creative.id}">Analyze</button>
        </div>
      </div>
    </div>
  `;
}

function bindEvents(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      handleAction(action, id);
    });
  });
}

function handleAction(action, id) {
  switch (action) {
    case 'openSensei':
      window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'sensei' }));
      break;
    case 'pauseLoserAds':
      CoreAPI.showToast('Pausiere Loser Ads...', 'warning');
      setTimeout(() => CoreAPI.showToast('Loser Ads pausiert', 'success'), 1000);
      break;
    case 'scaleWinners':
      CoreAPI.showToast('Skaliere Winner Ads...', 'info');
      break;
    case 'testBudget':
      CoreAPI.showToast('Teste Budget +20%...', 'info');
      break;
    case 'adjustBudget':
      CoreAPI.showToast('Budget-Anpassung...', 'info');
      break;
    case 'scaleAd':
      CoreAPI.showToast(`Scale Ad ${id}...`, 'info');
      break;
    case 'analyzeAd':
      CoreAPI.showToast(`Analyze Ad ${id}...`, 'info');
      break;
    case 'viewAllWinners':
      window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'creativeLibrary' }));
      break;
  }
}

function getTrendClass(trend, type) {
  if (type === 'spend') {
    return trend > 0 ? 'trend-negative-v7' : 'trend-positive-v7';
  }
  return trend > 0 ? 'trend-positive-v7' : 'trend-negative-v7';
}

function formatCurrency(value) {
  if (!value) return '€0';
  return `€${Math.round(value).toLocaleString('de-DE')}`;
}

function formatRoas(value) {
  if (!value) return '0.0x';
  return `${Number(value).toFixed(1)}x`;
}

function loadModuleCSS() {
  if (document.getElementById('dashboard-module-css')) return;
  const link = document.createElement('link');
  link.id = 'dashboard-module-css';
  link.rel = 'stylesheet';
  link.href = '/packages/dashboard/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('dashboard-module-css');
  if (link) link.remove();
}
