/**
 * SignalOne - Testing Log Module
 * 
 * Features:
 * - A/B Test Historie
 * - Winner/Loser Analyse
 * - Performance Vergleich
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'testingLog',
  label: 'Testing Log',
  requiresData: true
};

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Testing Log...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    
    const data = await DataLayer.fetchTestingLog(
      state.selectedBrand,
      null
    );
    
    if (!data || !data.tests || data.tests.length === 0) {
      throw new Error('Keine Tests verfügbar');
    }
    
    container.innerHTML = renderTestingLog(data, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[TestingLog] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Testing Log konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
}

function renderTestingLog(data, state) {
  const brandName = state.selectedBrand?.name || 'Brand';
  
  return `
    <div class="testinglog-container">
      
      <div class="testinglog-header">
        <div>
          <h1 class="testinglog-title">🧪 Testing Log</h1>
          <p class="testinglog-subtitle">${brandName} • ${data.tests.length} Tests durchgeführt</p>
        </div>
      </div>
      
      <div class="tests-grid">
        ${data.tests.map(test => renderTestCard(test)).join('')}
      </div>
      
    </div>
  `;
}

function renderTestCard(test) {
  const winnerRoas = test.winner === 'A' ? test.roasA : test.roasB;
  const loserRoas = test.winner === 'A' ? test.roasB : test.roasA;
  const winnerName = test.winner === 'A' ? test.creativeA : test.creativeB;
  const loserName = test.winner === 'A' ? test.creativeB : test.creativeA;
  const delta = ((winnerRoas - loserRoas) / loserRoas * 100).toFixed(0);
  
  return `
    <div class="test-card">
      <div class="test-date">📅 ${test.date}</div>
      
      <div class="test-comparison">
        
        <div class="test-creative winner">
          <div class="creative-badge winner-badge">🏆 Winner</div>
          <div class="creative-name">${winnerName}</div>
          <div class="creative-roas">${winnerRoas}x ROAS</div>
        </div>
        
        <div class="test-vs">vs</div>
        
        <div class="test-creative loser">
          <div class="creative-badge loser-badge">🛑 Loser</div>
          <div class="creative-name">${loserName}</div>
          <div class="creative-roas">${loserRoas}x ROAS</div>
        </div>
        
      </div>
      
      <div class="test-result">
        <span class="result-icon">📈</span>
        <span class="result-text">+${delta}% bessere Performance</span>
      </div>
      
      <div class="test-reason">
        <strong>Grund:</strong> ${test.reason}
      </div>
      
    </div>
  `;
}

function bindEvents(container) {
  const cards = container.querySelectorAll('.test-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      CoreAPI.toast('Test-Details werden geladen...', 'info');
    });
  });
}

function loadModuleCSS() {
  if (document.getElementById('testinglog-css')) return;
  const link = document.createElement('link');
  link.id = 'testinglog-css';
  link.rel = 'stylesheet';
  link.href = '/packages/testingLog/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('testinglog-css');
  if (link) link.remove();
}
