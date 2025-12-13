/**
 * Dashboard Render - HTML Generation
 * 
 * Erstellt das komplette Dashboard-HTML aus computed data:
 * - Hero Section mit KPIs
 * - Performance Trend Chart
 * - Account Signals
 * - Sensei Box
 */

/**
 * Render Complete Dashboard
 * @param {Object} computed - Computed data from compute.js
 * @returns {String} HTML string
 */
export function renderDashboard(computed) {
  const { kpis, trend, signals, sensei } = computed;
  
  return `
    <div class="dashboard-container">
      ${renderHero(kpis)}
      
      <div class="dashboard-grid">
        <div class="dashboard-col-left">
          ${renderPerformanceTrend(trend)}
        </div>
        
        <div class="dashboard-col-right">
          ${renderAccountSignals(signals)}
          ${renderSenseiBox(sensei)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Hero Section
 */
function renderHero(kpis) {
  return `
    <div class="dashboard-hero">
      <div class="hero-eyebrow">
        <span class="hero-dot"></span>
        LIVE MISSION CONTROL
      </div>
      
      <div class="hero-title">
        PROFIT · SPEND · ROAS · MOMENTUM
      </div>
      
      <div class="hero-subtitle">
        Zeitraum: Letzte 30 Tage · Währung: EUR · TZ: Europe/Berlin
      </div>
      
      <div class="hero-kpis">
        ${renderKPICard('Ad Spend (30 Tage)', kpis.formatted.spend, kpis.formatted.deltaSpend, kpis.directions.spend, 'Budget, das in Meta Ads investiert wurde.')}
        ${renderKPICard('Revenue (30 Tage)', kpis.formatted.revenue, kpis.formatted.deltaRevenue, kpis.directions.revenue, 'Umsatz, der aus bezahltem Traffic stammt.')}
        ${renderKPICard('ROAS', kpis.formatted.roas, kpis.formatted.deltaRoas, kpis.directions.roas, 'Return on Ad Spend – Effizienz deines Accounts.')}
        ${renderKPICard('Estimated Profit', kpis.formatted.profit, kpis.formatted.deltaProfit, kpis.directions.profit, 'Vereinfachte Profit-Schätzung aus deinem Paid-Social-Setup (30 Tage).')}
      </div>
    </div>
  `;
}

/**
 * Render Single KPI Card
 */
function renderKPICard(label, value, delta, direction, subtitle) {
  const deltaClass = direction === 'positive' ? 'pos' : direction === 'negative' ? 'neg' : 'neutral';
  const deltaIcon = direction === 'positive' ? '▲' : direction === 'negative' ? '▼' : '●';
  
  return `
    <div class="kpi-card ${direction}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-subtitle">${subtitle}</div>
      <div class="kpi-change ${deltaClass}">
        <span class="kpi-icon">${deltaIcon}</span>
        <span>${delta}</span>
        <span class="kpi-compare">vs. Vormonat</span>
      </div>
    </div>
  `;
}

/**
 * Render Performance Trend
 */
function renderPerformanceTrend(trend) {
  return `
    <div class="dashboard-section">
      <div class="section-header">
        <div>
          <div class="section-icon">📊</div>
          <h2 class="section-title">Performance-Tendenz (7 Tage)</h2>
        </div>
        <div class="section-stats">
          <div class="stat-item">
            <span class="stat-label">Ø ROAS:</span>
            <span class="stat-value">${trend.avgRoas}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Peak:</span>
            <span class="stat-value">${trend.peakRoas}</span>
          </div>
        </div>
      </div>
      
      <div class="section-subtitle">
        ROAS-Bewegung über die Woche — Live-Monitoring deiner Account-Performance
      </div>
      
      <div class="trend-chart">
        ${trend.days.map(day => renderTrendBar(day)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Single Trend Bar
 */
function renderTrendBar(day) {
  return `
    <div class="trend-row">
      <div class="trend-day">${day.label}</div>
      <div class="trend-bar">
        <div class="trend-fill" style="width: ${day.percentage}%"></div>
      </div>
      <div class="trend-value">${day.formatted}</div>
    </div>
  `;
}

/**
 * Render Account Signals
 */
function renderAccountSignals(signals) {
  if (!signals || signals.length === 0) {
    return `
      <div class="dashboard-section">
        <div class="section-header">
          <div>
            <div class="section-icon">🚨</div>
            <h2 class="section-title">Account Signals</h2>
          </div>
        </div>
        <div class="section-subtitle">
          Zusammenfassung der wichtigsten Hinweise für diesen Brand.
        </div>
        <div class="empty-state">
          Keine Signale vorhanden.
        </div>
      </div>
    `;
  }
  
  return `
    <div class="dashboard-section">
      <div class="section-header">
        <div>
          <div class="section-icon">🚨</div>
          <h2 class="section-title">Account Signals</h2>
        </div>
      </div>
      <div class="section-subtitle">
        Zusammenfassung der wichtigsten Hinweise für diesen Brand.
      </div>
      
      <div class="signals-list">
        ${signals.map(signal => renderSignalItem(signal)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Single Signal Item
 */
function renderSignalItem(signal) {
  return `
    <div class="signal-item ${signal.type}">
      <div class="signal-header">
        <div class="signal-title">${signal.title}</div>
        <div class="signal-badge">${signal.badge}</div>
      </div>
      <div class="signal-message">${signal.message}</div>
    </div>
  `;
}

/**
 * Render Sensei Box
 */
function renderSenseiBox(sensei) {
  return `
    <div class="dashboard-section sensei-box">
      <div class="section-header">
        <div>
          <div class="section-icon">🧠</div>
          <h2 class="section-title">SignalOne Sensei</h2>
        </div>
      </div>
      
      <div class="sensei-content">
        <div class="sensei-title">${sensei.title}</div>
        <div class="sensei-message">${sensei.message}</div>
        ${sensei.cta ? `
          <button class="sensei-cta">${sensei.cta}</button>
        ` : ''}
      </div>
    </div>
  `;
}
