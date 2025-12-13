/**
 * SignalOne - Sensei V7.0 AI INSIGHTS
 * Smart Analysis | Recommendations | Elite Design
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'sensei',
  label: 'Sensei AI',
  requiresData: true
};

let moduleData = null;

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Sensei AI...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    const [dashboardData, creatives] = await Promise.all([
      DataLayer.fetchDashboardData(state.selectedBrand, null, state.selectedCampaign),
      DataLayer.fetchCreatives(state.selectedBrand, null, state.selectedCampaign)
    ]);
    
    const analysis = generateAnalysis(dashboardData, creatives);
    moduleData = { analysis, dashboardData, creatives };
    
    container.innerHTML = renderSensei(analysis, dashboardData, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[Sensei] Error:', error);
    container.innerHTML = `<div style="text-align: center; padding: 4rem; color: #ef4444;">${error.message}</div>`;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
}

function generateAnalysis(data, creatives) {
  const score = Math.min(100, Math.round((data.roas / 5.0) * 100));
  const insights = [
    { icon: '🏆', title: 'Top Performer', text: `${creatives[0]?.name} generiert ${formatRoas(creatives[0]?.roas)} ROAS`, priority: 'high' },
    { icon: '⚠️', title: 'Budget Warning', text: 'Daily budget bei 82% - Adjustment empfohlen', priority: 'medium' },
    { icon: '📈', title: 'Scaling Opportunity', text: '3 Ads mit ROAS > 5.0x bereit zum Skalieren', priority: 'high' }
  ];
  
  const recommendations = [
    { action: 'Scale Winners', description: 'Erhöhe Budget für Top 3 Ads um +30%', impact: '+€15K Revenue', priority: 'high' },
    { action: 'Pause Losers', description: 'Stoppe 5 Ads mit ROAS < 2.5x', impact: '-€2.3K Wasted Spend', priority: 'high' },
    { action: 'Test New Creatives', description: 'Erstelle 3 neue Varianten basierend auf Winners', impact: '+20% Potential', priority: 'medium' }
  ];
  
  return { score, insights, recommendations };
}

function renderSensei(analysis, data, state) {
  return `
    <div class="sensei-v7">
      
      <!-- HEADER -->
      <div class="sensei-header-v7">
        <h1>Sensei AI Analysis</h1>
        <p class="subtitle-v7">Datenbasierte Insights & Empfehlungen</p>
      </div>
      
      <div class="sensei-layout-v7">
        
        <!-- SCORE CARD -->
        <div class="score-card-v7">
          <div class="score-icon-v7">🧠</div>
          <div class="score-number-v7" style="color: ${analysis.score >= 85 ? '#D4AF37' : '#6E6E73'};">${analysis.score}</div>
          <div class="score-label-v7">HEALTH SCORE</div>
          <div class="score-bar-v7">
            <div class="score-fill-v7" style="width: ${analysis.score}%; background: ${analysis.score >= 85 ? '#D4AF37' : '#6E6E73'};"></div>
          </div>
          <div class="score-status-v7">${analysis.score >= 85 ? 'EXCELLENT' : analysis.score >= 70 ? 'GOOD' : 'NEEDS WORK'}</div>
        </div>
        
        <!-- INSIGHTS GRID -->
        <div class="insights-section-v7">
          <div class="section-title-v7">Key Insights</div>
          <div class="insights-grid-v7">
            ${analysis.insights.map(insight => `
              <div class="insight-card-v7 priority-${insight.priority}">
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
          <div class="section-title-v7">Recommended Actions</div>
          ${analysis.recommendations.map((rec, i) => `
            <div class="recommendation-card-v7">
              <div class="rec-number-v7">${i + 1}</div>
              <div class="rec-content-v7">
                <div class="rec-action-v7">${rec.action}</div>
                <div class="rec-description-v7">${rec.description}</div>
                <div class="rec-impact-v7">${rec.impact}</div>
              </div>
              <button class="rec-button-v7" data-action="execute" data-rec="${i}">Execute</button>
            </div>
          `).join('')}
        </div>
        
      </div>
      
    </div>
  `;
}

function bindEvents(container) {
  container.querySelectorAll('[data-action="execute"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = btn.dataset.rec;
      CoreAPI.showToast(`Executing recommendation ${parseInt(rec) + 1}...`, 'info');
    });
  });
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
