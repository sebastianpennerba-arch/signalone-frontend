/**
 * SignalOne - Sensei V8.2 UNIFIED SCORE
 * 
 * ✅ P1-11: Unified Sensei Score Engine Integration
 * - Consistent score calculation with Dashboard
 * - Real data analysis from creatives
 * - Shared scoring logic from shared/senseiScore.js
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';
import { calculateSenseiScore, renderSenseiScoreGrid, getScoreColor, getScoreLabel } from '../../shared/senseiScore.js';

export const meta = {
  id: 'sensei',
  label: 'Sensei AI',
  requiresData: true
};

let _root = null;
let _moduleData = null;
let _mounted = false;

export async function render(container) {
  _root = container;
  
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">🧠 Lade Sensei AI...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    
    console.log('[Sensei] 🧠 Loading REAL data analysis...');
    
    const [dashboardData, creatives] = await Promise.all([
      DataLayer.fetchDashboardData(state.selectedBrand, null, state.selectedCampaign),
      DataLayer.fetchCreatives(state.selectedBrand, null, state.selectedCampaign)
    ]);
    
    if (!creatives || creatives.length === 0) {
      throw new Error('Keine Creatives verfügbar für Analyse');
    }
    
    // ✅ P1-11: Use unified score calculation
    const senseiScore = calculateSenseiScore(dashboardData, {
      roas: dashboardData.roas || 0,
      spend: dashboardData.spend || 0,
      ctr: dashboardData.ctr || 0,
      cpm: dashboardData.cpm || 0,
      frequency: dashboardData.frequency || 0
    });
    
    const analysis = generateRealAnalysis(dashboardData, creatives, senseiScore);
    _moduleData = { analysis, dashboardData, creatives, state, senseiScore };
    
    console.log('[Sensei] 🎯 Unified Score:', senseiScore.score);
    console.log('[Sensei] 💡 Insights:', analysis.insights.length);
    console.log('[Sensei] 🎯 Recommendations:', analysis.recommendations.length);
    console.log('[Sensei] 📊 Top Performer:', analysis.topPerformer?.name);
    
    container.innerHTML = renderSensei(analysis, dashboardData, state, senseiScore);
    
    mount(container);
    
  } catch (error) {
    console.error('[Sensei] ❌ Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Sensei AI konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export function mount(container) {
  _root = container || _root;
  
  if (_mounted && _root) {
    _root.removeEventListener('click', onClick);
  }
  
  if (!_root) return;
  
  console.log('[Sensei] 🎯 Mounting event listeners...');
  
  _root.addEventListener('click', onClick);
  
  _mounted = true;
  console.log('[Sensei] ✅ Mounted successfully');
}

export async function destroy(container) {
  const r = container || _root;
  if (r) {
    r.removeEventListener('click', onClick);
    r.innerHTML = '';
  }
  
  unloadModuleCSS();
  
  _root = null;
  _moduleData = null;
  _mounted = false;
  
  console.log('[Sensei] 🧹 Destroyed');
}

/* ==================== EVENT HANDLERS ==================== */

function onClick(e) {
  const t = e.target;
  if (!t) return;
  
  // Execute recommendation button
  if (t.closest('[data-action="execute"]')) {
    const btn = t.closest('[data-action="execute"]');
    const recIndex = parseInt(btn.dataset.rec);
    const rec = _moduleData?.analysis?.recommendations?.[recIndex];
    
    if (rec) {
      console.log('[Sensei] ⚡ Executing:', rec.action);
      CoreAPI.toast(`⚡ ${rec.action} wird ausgeführt...`, 'info');
      // TODO: Implement actual action execution in Phase 2
    }
    return;
  }
  
  // Insight card click
  if (t.closest('.insight-card-v7')) {
    const card = t.closest('.insight-card-v7');
    console.log('[Sensei] 👁️ Insight clicked');
    CoreAPI.toast('Insight Details kommen in P2.2', 'info');
    return;
  }
}

/* ==================== REAL DATA ANALYSIS ==================== */

function generateRealAnalysis(data, creatives, senseiScore) {
  console.log('[Sensei] 📊 Analyzing', creatives.length, 'creatives...');
  
  // Sort by ROAS descending
  const sorted = [...creatives].sort((a, b) => (b.roas || 0) - (a.roas || 0));
  
  // Top performer
  const topPerformer = sorted[0];
  
  // High performers (ROAS >= 5.0)
  const highPerformers = creatives.filter(c => (c.roas || 0) >= 5.0);
  
  // Mid performers (ROAS 3.0 - 5.0)
  const midPerformers = creatives.filter(c => (c.roas || 0) >= 3.0 && (c.roas || 0) < 5.0);
  
  // Losers (ROAS < 2.5)
  const losers = creatives.filter(c => (c.roas || 0) < 2.5);
  
  // Calculate total spend
  const totalSpend = creatives.reduce((sum, c) => sum + (c.spend || 0), 0);
  
  // Calculate wasted spend from losers
  const wastedSpend = losers.reduce((sum, c) => sum + (c.spend || 0), 0);
  
  // Budget usage (assume 20% headroom)
  const estimatedBudget = totalSpend * 1.2;
  const budgetUsage = Math.round((totalSpend / estimatedBudget) * 100);
  
  console.log('[Sensei] 🎯 Score breakdown from unified engine:', {
    score: senseiScore.score,
    tier: senseiScore.tier,
    label: senseiScore.label,
    factors: senseiScore.factors
  });
  
  // Generate insights
  const insights = [];
  
  // Insight 1: Top Performer
  if (topPerformer) {
    insights.push({
      icon: '🏆',
      title: 'Top Performer',
      text: `${topPerformer.name} generiert ${formatRoas(topPerformer.roas)} ROAS`,
      priority: 'high'
    });
  }
  
  // Insight 2: Budget Status
  insights.push({
    icon: budgetUsage > 80 ? '⚠️' : budgetUsage > 60 ? '📊' : '✅',
    title: budgetUsage > 80 ? 'Budget Warning' : budgetUsage > 60 ? 'Budget Monitor' : 'Budget Healthy',
    text: `Daily budget bei ${budgetUsage}% - ${budgetUsage > 80 ? 'Adjustment empfohlen' : budgetUsage > 60 ? 'Im Auge behalten' : 'Alles im grünen Bereich'}`,
    priority: budgetUsage > 80 ? 'high' : budgetUsage > 60 ? 'medium' : 'low'
  });
  
  // Insight 3: Scaling Opportunity
  insights.push({
    icon: highPerformers.length > 0 ? '📈' : '🔍',
    title: highPerformers.length > 0 ? 'Scaling Opportunity' : 'No High Performers',
    text: highPerformers.length > 0 
      ? `${highPerformers.length} ${highPerformers.length === 1 ? 'Ad' : 'Ads'} mit ROAS > 5.0x bereit zum Skalieren`
      : 'Keine Ads mit ROAS > 5.0x gefunden - Optimierung nötig',
    priority: highPerformers.length > 0 ? 'high' : 'medium'
  });
  
  // Insight 4: Score Tier Insight
  insights.push({
    icon: senseiScore.score >= 70 ? '✨' : senseiScore.score >= 40 ? '🔴' : '🔴',
    title: `Score: ${senseiScore.label}`,
    text: `Deine Performance liegt im "${senseiScore.label}"-Bereich - ${senseiScore.score >= 70 ? 'Starke Basis!' : senseiScore.score >= 40 ? 'Optimierung empfohlen' : 'Dringender Handlungsbedarf'}`,
    priority: senseiScore.score >= 70 ? 'low' : senseiScore.score >= 40 ? 'medium' : 'high'
  });
  
  // Generate recommendations
  const recommendations = [];
  
  // Recommendation 1: Scale Winners (if available)
  if (highPerformers.length > 0) {
    const scaleCount = Math.min(3, highPerformers.length);
    const potentialRevenue = Math.round(totalSpend * (data.roas || 0) * 0.3);
    recommendations.push({
      action: 'Scale Winners',
      description: `Erhöhe Budget für Top ${scaleCount} ${scaleCount === 1 ? 'Ad' : 'Ads'} um +30%`,
      impact: `+€${potentialRevenue.toLocaleString('de-DE')} Revenue`,
      priority: 'high'
    });
  }
  
  // Recommendation 2: Pause Losers (if any)
  if (losers.length > 0) {
    const savePotential = Math.round(wastedSpend * 0.5);
    recommendations.push({
      action: 'Pause Losers',
      description: `Stoppe ${losers.length} ${losers.length === 1 ? 'Ad' : 'Ads'} mit ROAS < 2.5x`,
      impact: `-€${savePotential.toLocaleString('de-DE')} Wasted Spend`,
      priority: 'high'
    });
  }
  
  // Recommendation 3: Test New Creatives or Optimize Mid Performers
  if (midPerformers.length > 0) {
    recommendations.push({
      action: 'Optimize Mid-Performers',
      description: `${midPerformers.length} Ads mit ROAS 3.0-5.0x optimieren`,
      impact: '+15-25% Potential',
      priority: 'medium'
    });
  } else {
    recommendations.push({
      action: 'Test New Creatives',
      description: 'Erstelle 3 neue Varianten basierend auf Top Performer',
      impact: '+20% Potential',
      priority: 'medium'
    });
  }
  
  return { 
    insights, 
    recommendations,
    topPerformer,
    stats: {
      highPerformers: highPerformers.length,
      midPerformers: midPerformers.length,
      losers: losers.length,
      totalSpend,
      wastedSpend,
      budgetUsage
    }
  };
}

/* ==================== RENDERING ==================== */

function renderSensei(analysis, data, state, senseiScore) {
  const brandName = state.selectedBrand?.name || 'Brand';
  
  return `
    <div class="sensei-v7">
      
      <!-- HEADER -->
      <div class="sensei-header-v7">
        <div>
          <h1>🧠 Sensei AI Analysis</h1>
          <p class="subtitle-v7">${brandName} • Datenbasierte Insights & Empfehlungen</p>
        </div>
      </div>
      
      <div class="sensei-layout-v7">
        
        <!-- ✅ P1-11: UNIFIED SCORE CARD -->
        <div class="score-card-v7">
          <div class="score-icon-v7">🧠</div>
          <div class="score-number-v7" style="color: ${senseiScore.color};">${senseiScore.score}</div>
          <div class="score-label-v7">SENSEI SCORE</div>
          <div class="score-bar-v7">
            <div class="score-fill-v7" style="width: ${senseiScore.score}%; background: ${senseiScore.color};"></div>
          </div>
          <div class="score-status-v7" style="color: ${senseiScore.color};">${senseiScore.label.toUpperCase()}</div>
          <div class="score-description-v7">
            ${getScoreDescription(senseiScore.score, senseiScore.tier)}
          </div>
          
          <!-- Score Factors Breakdown -->
          <div class="score-factors-v7">
            <div class="factors-title-v7">Score Faktoren:</div>
            ${senseiScore.factors.map(factor => `
              <div class="factor-item-v7">
                <div class="factor-header-v7">
                  <span class="factor-name-v7">${factor.name}</span>
                  <span class="factor-value-v7">${factor.value}</span>
                </div>
                <div class="factor-bar-container-v7">
                  <div class="factor-bar-v7" style="width: ${factor.score}%; background: ${getScoreColor(factor.score)};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- INSIGHTS GRID -->
        <div class="insights-section-v7">
          <div class="section-title-v7">💡 Key Insights</div>
          <div class="insights-grid-v7">
            ${analysis.insights.map(insight => `
              <div class="insight-card-v7 priority-${insight.priority}" role="button" tabindex="0">
                <div class="insight-icon-v7">${insight.icon}</div>
                <div class="insight-content-v7">
                  <div class="insight-title-v7">${insight.title}</div>
                  <div class="insight-text-v7">${insight.text}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- RECOMMENDATIONS -->
        <div class="recommendations-section-v7">
          <div class="section-title-v7">🎯 Recommended Actions</div>
          ${analysis.recommendations.map((rec, i) => `
            <div class="recommendation-card-v7">
              <div class="rec-number-v7">${i + 1}</div>
              <div class="rec-content-v7">
                <div class="rec-action-v7">${rec.action}</div>
                <div class="rec-description-v7">${rec.description}</div>
                <div class="rec-impact-v7">📈 ${rec.impact}</div>
              </div>
              <button class="rec-button-v7" data-action="execute" data-rec="${i}">
                ⚡ Execute
              </button>
            </div>
          `).join('')}
        </div>
        
      </div>
      
    </div>
  `;
}

/* ==================== HELPERS ==================== */

function getScoreDescription(score, tier) {
  if (score >= 70) return 'Deine Kampagnen performen ausgezeichnet! Weiter so.';
  if (score >= 40) return 'Solide Performance mit Optimierungspotenzial.';
  return 'Dringende Optimierung erforderlich - folge den Recommendations.';
}

function formatRoas(value) {
  const safe = Number(value) || 0;
  return safe ? `${safe.toFixed(1)}x` : '0.0x';
}

function loadModuleCSS() {
  if (document.getElementById('sensei-module-css')) return;
  const link = document.createElement('link');
  link.id = 'sensei-module-css';
  link.rel = 'stylesheet';
  link.href = '/packages/sensei/module.css';
  document.head.appendChild(link);
  
  // ✅ Load shared Sensei Score CSS
  if (!document.getElementById('sensei-score-css')) {
    const scoreLink = document.createElement('link');
    scoreLink.id = 'sensei-score-css';
    scoreLink.rel = 'stylesheet';
    scoreLink.href = '/shared/senseiScore.css';
    document.head.appendChild(scoreLink);
  }
}

function unloadModuleCSS() {
  const link = document.getElementById('sensei-module-css');
  if (link) link.remove();
}
