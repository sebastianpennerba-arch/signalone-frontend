// data/DataLayer.js
// V3.1 HOTFIX - NULL-SAFE BRAND/CAMPAIGN HANDLING
// + UNIFIED SENSEI SCORE CALCULATION

import { buildDemoDashboard } from "./demoDashboard.js";
import { buildDemoCreativeLibrary } from "./demoCreativeLibrary.js";
import { buildDemoSenseiResponse } from "./demoSensei.js";
import { normalizeSenseiAnalysis } from "../packages/sensei/compute.js";

export class DataLayer {
  constructor() {
    this.cache = new Map();
  }

  // =========================
  // DASHBOARD DATA
  // =========================

  async getDashboardData(appState) {
    console.log('[DataLayer] getDashboardData', appState);

    // HOTFIX: Null-safe brand/campaign check
    const brand = appState?.selectedBrand?.name || null;
    const campaign = appState?.selectedCampaign?.name || null;

    if (!brand) {
      console.warn('[DataLayer] No brand selected, returning empty dashboard');
      return this._getEmptyDashboard();
    }

    const mode = appState?.mode || 'demo';

    if (mode === 'live') {
      console.log('[DataLayer] Live mode - returning empty dashboard (backend not implemented)');
      return this._getEmptyDashboard();
    }

    // Demo Mode
    const demo = buildDemoDashboard(brand, campaign);
    
    // HOTFIX: Calculate unified Sensei Score
    demo.senseiScore = this._calculateSenseiScore(demo);
    
    return demo;
  }

  _getEmptyDashboard() {
    return {
      summary: {
        spend30d: 0,
        revenue30d: 0,
        roas30d: 0,
        profitEst30d: 0,
        deltaSpend: 0,
        deltaRevenue: 0,
        deltaRoas: 0,
        deltaProfit: 0,
      },
      performanceTrend: {
        days: [],
        roasAvg: 0,
        roasPeak: 0,
      },
      signals: [],
      sensei: [],
      senseiScore: 0,
    };
  }

  // =========================
  // CREATIVE LIBRARY DATA
  // =========================

  async getCreativeLibraryData(appState) {
    console.log('[DataLayer] getCreativeLibraryData', appState);

    // HOTFIX: Null-safe brand/campaign check
    const brand = appState?.selectedBrand?.name || null;
    const campaign = appState?.selectedCampaign?.name || null;

    if (!brand) {
      console.warn('[DataLayer] No brand selected, returning empty library');
      return { creatives: [] };
    }

    const mode = appState?.mode || 'demo';

    if (mode === 'live') {
      console.log('[DataLayer] Live mode - returning empty library (backend not implemented)');
      return { creatives: [] };
    }

    // Demo Mode
    return buildDemoCreativeLibrary(brand, campaign);
  }

  // =========================
  // SENSEI DATA
  // =========================

  async getSenseiData(appState) {
    console.log('[DataLayer] getSenseiData', appState);

    // HOTFIX: Null-safe brand/campaign check
    const brand = appState?.selectedBrand?.name || null;
    const campaign = appState?.selectedCampaign?.name || null;

    if (!brand) {
      console.warn('[DataLayer] No brand selected, returning null');
      return null;
    }

    const mode = appState?.mode || 'demo';

    if (mode === 'live') {
      console.log('[DataLayer] Live mode - returning null (backend not implemented)');
      return null;
    }

    // Demo Mode
    const raw = buildDemoSenseiResponse(brand, campaign);
    return normalizeSenseiAnalysis(raw, { mode, accountId: brand });
  }

  // =========================
  // HOTFIX: UNIFIED SENSEI SCORE
  // =========================

  _calculateSenseiScore(dashboardData) {
    // Use same calculation as Sensei module
    const summary = dashboardData.summary || {};
    const roas = Number(summary.roas30d) || 0;
    const deltaRoas = Number(summary.deltaRoas) || 0;
    
    // Base score from ROAS
    let score = 0;
    if (roas >= 4.5) score = 85;
    else if (roas >= 3.5) score = 75;
    else if (roas >= 2.5) score = 65;
    else if (roas >= 2.0) score = 55;
    else if (roas >= 1.5) score = 45;
    else score = 30;
    
    // Adjust for trend
    if (deltaRoas > 0.1) score += 5;
    else if (deltaRoas < -0.1) score -= 5;
    
    // Cap at 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// Global singleton
let _instance = null;

export function getDataLayer() {
  if (!_instance) {
    _instance = new DataLayer();
  }
  return _instance;
}
