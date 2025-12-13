/**
 * SignalOne - Sensei V8.1 AI INSIGHTS
 * Smart Analysis | Recommendations | Elite Design
 * 
 * 🔥 V8.1 FIX:
 * - REAL DATA from creatives!
 * - Consistent metrics
 * - No random dummy data
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

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
    
    const analysis = generateRealAnalysis(dashboardData, creatives);
    _moduleData = { analysis, dashboardData, creatives, state };
    
    console.log('[Sensei] 🎯 Health Score:', analysis.score);
    console.log('[Sensei] 💡 Insights:', analysis.insights.length);
    console.log('[Sensei] 🎯 Recommendations:', analysis.recommendations.length);
    console.log('[Sensei] 📊 Top Performer:', analysis.topPerformer?.name);
    
    container.innerHTML = renderSensei(analysis, dashboardData, state);
    
    // 🔥 AUTO-MOUNT!
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
  
  // Cleanup old listeners
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
      // TODO: Implement actual action execution
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

function generateRealAnalysis(data, creatives) {
  console.log('[Sensei] 📊 Analyzing', creatives.length, 'creatives...');
  
  // Sort by ROAS descending
  const sorted = [...creatives].sort((a, b) => b.roas - a.roas);
  
  // Top performer
  const topPerformer = sorted[0];
  
  // High performers (ROAS >= 5.0)
  const highPerformers = creatives.filter(c => c.roas >= 5.0);
  
  // Mid performers (ROAS 3.0 - 5.0)
  const midPerformers = creatives.filter(c => c.roas >= 3.0 && c.roas < 5.0);
  
  // Losers (ROAS < 2.5)
  const losers = creatives.filter(c => c.roas < 2.5);
  
  // Calculate total spend
  const totalSpend = creatives.reduce((sum, c) => sum + (c.spend || 0), 0);
  
  // Calculate wasted spend from losers
  const wastedSpend = losers.reduce((sum, c) => sum + (c.spend || 0), 0);
  
  // Budget usage (assume 20% headroom)
  const estimatedBudget = totalSpend * 1.2;
  const budgetUsage = Math.round((totalSpend / estimatedBudget) * 100);
  
  // Health Score calculation
  const avgRoas = data.roas || 0;
  const targetRoas = 5.0;
  const roasScore = Math.min(100, Math.round((avgRoas / targetRoas) * 100));
  
  // Bonus for high performers
  const highPerformerBonus = Math.min(15, highPerformers.length * 3);
  
  // Penalty for losers
  const loserPenalty = Math.min(15, losers.length * 2);
  
  const score = Math.max(0, Math.min(100, roasScore + highPerformerBonus - loserPenalty));
  
  console.log('[Sensei] 🎯 Score breakdown:', {
    avgRoas,
    roasScore,
    highPerformerBonus,
    loserPenalty,
    finalScore: score
  });
  
  // Generate insights
  const insights = [];
  
  // Insight 1: Top Performer
  insights.push({
    icon: '🏆',
    title: 'Top Performer',
    text: `${topPerformer.name} generiert ${formatRoas(topPerformer.roas)} ROAS`,
    priority: 'high'
  });
  
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
  
  // Generate recommendations
  const recommendations = [];
  
  // Recommendation 1: Scale Winners (if available)
  if (highPerformers.length > 0) {
    const scaleCount = Math.min(3, highPerformers.length);
    const potentialRevenue = Math.round(totalSpend * avgRoas * 0.3);
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
    score, 
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

function renderSensei(analysis, data, state) {
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
        
        <!-- SCORE CARD -->
        <div class="score-card-v7">
          <div class="score-icon-v7">🧠</div>
          <div class="score-number-v7" style="color: ${getScoreColor(analysis.score)};">${analysis.score}</div>
          <div class="score-label-v7">HEALTH SCORE</div>
          <div class="score-bar-v7">
            <div class="score-fill-v7" style="width: ${analysis.score}%; background: ${getScoreColor(analysis.score)};"></div>
          </div>
          <div class="score-status-v7" style="color: ${getScoreColor(analysis.score)};">${getScoreStatus(analysis.score)}</div>
          <div class="score-description-v7">
            ${getScoreDescription(analysis.score)}
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

function getScoreColor(score) {
  if (score >= 85) return '#D4AF37'; // Gold
  if (score >= 70) return '#10B981'; // Green
  if (score >= 50) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
}

function getScoreStatus(score) {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'FAIR';
  return 'NEEDS WORK';
}

function getScoreDescription(score) {
  if (score >= 85) return 'Deine Kampagnen performen ausgezeichnet!';
  if (score >= 70) return 'Solide Performance mit Optimierungspotenzial.';
  if (score >= 50) return 'Es gibt Raum für Verbesserungen.';
  return 'Dringende Optimierung erforderlich.';
}

function formatRoas(value) {
  return value ? `${Number(value).toFixed(1)}x` : '0.0x';
}

function loadModuleCSS() {
  if (document.getElementById('sensei-module-css')) return;
  const link = document.createElement('link');
  link.id = 'sensei-module-css';
  link.rel = 'stylesheet';
  link.href = '/packages/sensei/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('sensei-module-css');
  if (link) link.remove();
}
