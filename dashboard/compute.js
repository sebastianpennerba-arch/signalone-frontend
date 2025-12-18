/**
 * Dashboard Compute - KPI Calculations
 * 
 * Berechnet alle KPIs aus rohen Daten:
 * - Spend, Revenue, ROAS, Profit
 * - Deltas (Vergleich zum Vormonat)
 * - Trend-Daten (7 Tage)
 * - Health Status
 */

/**
 * Compute Dashboard KPIs
 * @param {Object} data - Raw data from DataLayer
 * @returns {Object} Computed KPIs
 */
export function computeDashboardKPIs(data) {
  if (!data || !data.summary) {
    return getEmptyKPIs();
  }
  
  const summary = data.summary;
  
  // Hauptmetriken
  const spend = Number(summary.spend30d) || 0;
  const revenue = Number(summary.revenue30d) || 0;
  const roas = Number(summary.roas30d) || 0;
  const profit = Number(summary.profitEst30d) || 0;
  
  // Deltas (Veränderungen zum Vormonat)
  const deltaSpend = Number(summary.deltaSpend) || 0;
  const deltaRevenue = Number(summary.deltaRevenue) || 0;
  const deltaRoas = Number(summary.deltaRoas) || 0;
  const deltaProfit = Number(summary.deltaProfit) || 0;
  
  // Formatierte Werte
  const formatted = {
    spend: formatCurrency(spend),
    revenue: formatCurrency(revenue),
    roas: formatRoas(roas),
    profit: formatCurrency(profit),
    
    deltaSpend: formatPercent(deltaSpend),
    deltaRevenue: formatPercent(deltaRevenue),
    deltaRoas: formatPercent(deltaRoas),
    deltaProfit: formatPercent(deltaProfit),
  };
  
  // Delta-Richtungen
  const directions = {
    spend: getDeltaDirection(deltaSpend, 'spend'),
    revenue: getDeltaDirection(deltaRevenue, 'revenue'),
    roas: getDeltaDirection(deltaRoas, 'roas'),
    profit: getDeltaDirection(deltaProfit, 'profit'),
  };
  
  return {
    raw: { spend, revenue, roas, profit },
    deltas: { deltaSpend, deltaRevenue, deltaRoas, deltaProfit },
    formatted,
    directions,
  };
}

/**
 * Compute Performance Trend (7 Days)
 * @param {Object} data - Raw data from DataLayer
 * @returns {Array} Trend data
 */
export function computePerformanceTrend(data) {
  if (!data || !data.performanceTrend) {
    return getEmptyTrend();
  }
  
  const trend = data.performanceTrend;
  const days = trend.days || [];
  
  // Durchschnitt berechnen
  const avgRoas = trend.roasAvg || 0;
  const peakRoas = trend.roasPeak || 0;
  
  // Daten für Balkendiagramm
  const bars = days.map(day => ({
    label: day.day || 'N/A',
    value: day.roas || 0,
    percentage: peakRoas > 0 ? (day.roas / peakRoas) * 100 : 0,
    formatted: formatRoas(day.roas),
  }));
  
  return {
    days: bars,
    avgRoas: formatRoas(avgRoas),
    peakRoas: formatRoas(peakRoas),
  };
}

/**
 * Compute Account Signals
 * @param {Object} data - Raw data from DataLayer
 * @returns {Array} Signal items
 */
export function computeAccountSignals(data) {
  if (!data || !data.signals) {
    return [];
  }
  
  return data.signals.map(signal => ({
    type: signal.type || 'ok',
    title: getSignalTitle(signal.type),
    message: signal.message || 'Keine Details verfügbar.',
    badge: getSignalBadge(signal.type),
  }));
}

/**
 * Compute Sensei Insights
 * @param {Object} data - Raw data from DataLayer
 * @returns {Object} Sensei insight
 */
export function computeSenseiInsight(data) {
  if (!data || !data.sensei || !data.sensei.length) {
    return {
      title: 'Keine Empfehlungen',
      message: 'SignalOne Sensei analysiert deine Kampagnen. Komm später wieder.',
      cta: null,
    };
  }
  
  // Erste Empfehlung nehmen (höchste Priorität)
  const insight = data.sensei[0];
  
  return {
    title: insight.title || 'Empfehlung von Sensei',
    message: insight.message || 'Sensei hat eine Empfehlung für dich.',
    cta: insight.cta || null,
  };
}

// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * Format Currency (EUR)
 */
function formatCurrency(value) {
  if (!value || value === 0) return '0 €';
  
  // Tausender-Punkt für große Zahlen
  const formatted = Math.round(value).toLocaleString('de-DE');
  return `${formatted} €`;
}

/**
 * Format ROAS
 */
function formatRoas(value) {
  if (!value || value === 0) return '0.0x';
  return `${Number(value).toFixed(1)}x`;
}

/**
 * Format Percent
 */
function formatPercent(value) {
  if (!value || value === 0) return '0%';
  
  const sign = value > 0 ? '+' : '';
  const percent = Math.abs(value * 100).toFixed(0);
  return `${sign}${percent}%`;
}

/**
 * Get Delta Direction
 */
function getDeltaDirection(delta, metric) {
  if (delta === 0) return 'neutral';
  
  // Für Spend: Negativ ist gut (weniger ausgegeben)
  if (metric === 'spend') {
    return delta > 0 ? 'negative' : 'positive';
  }
  
  // Für alle anderen: Positiv ist gut
  return delta > 0 ? 'positive' : 'negative';
}

/**
 * Get Signal Title
 */
function getSignalTitle(type) {
  switch (type) {
    case 'ok':
      return 'Alles stabil';
    case 'warning':
      return 'Achtung';
    case 'danger':
    case 'critical':
      return 'Kritisch';
    default:
      return 'Status';
  }
}

/**
 * Get Signal Badge
 */
function getSignalBadge(type) {
  switch (type) {
    case 'ok':
      return 'OK';
    case 'warning':
      return 'Warnung';
    case 'danger':
    case 'critical':
      return 'Kritisch';
    default:
      return 'Info';
  }
}

/**
 * Get Empty KPIs (Fallback)
 */
function getEmptyKPIs() {
  return {
    raw: { spend: 0, revenue: 0, roas: 0, profit: 0 },
    deltas: { deltaSpend: 0, deltaRevenue: 0, deltaRoas: 0, deltaProfit: 0 },
    formatted: {
      spend: '0 €',
      revenue: '0 €',
      roas: '0.0x',
      profit: '0 €',
      deltaSpend: '0%',
      deltaRevenue: '0%',
      deltaRoas: '0%',
      deltaProfit: '0%',
    },
    directions: {
      spend: 'neutral',
      revenue: 'neutral',
      roas: 'neutral',
      profit: 'neutral',
    },
  };
}

/**
 * Get Empty Trend (Fallback)
 */
function getEmptyTrend() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  
  return {
    days: days.map(day => ({
      label: day,
      value: 0,
      percentage: 0,
      formatted: '0.0x',
    })),
    avgRoas: '0.0x',
    peakRoas: '0.0x',
  };
}
