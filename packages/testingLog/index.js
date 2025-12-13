/**
 * SignalOne - Testing Log Module V2.0
 * 
 * 🏆 COMPLETE REBUILD:
 * - Filters (outcome, date range)
 * - Sort (date, delta, roas)
 * - Search (creative names)
 * - Summary stats
 * - Working events
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'testingLog',
  label: 'Testing Log',
  requiresData: true
};

let _root = null;
let _moduleData = null;
let _state = null;
let _mounted = false;

let filters = {
  outcome: 'all', // 'all' | 'winner' | 'inconclusive'
  search: '',
  sort: 'date-desc' // 'date-desc' | 'delta-desc' | 'roas-desc'
};

export async function render(container) {
  _root = container;
  
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">🧪 Lade Testing Log...</div>';
    
    loadModuleCSS();
    
    _state = CoreAPI.getState();
    
    const data = await DataLayer.fetchTestingLog(
      _state.selectedBrand,
      null
    );
    
    if (!data || !data.tests || data.tests.length === 0) {
      container.innerHTML = renderEmptyState();
      return;
    }
    
    _moduleData = data;
    
    console.log('[TestingLog] 🧪 Loaded', data.tests.length, 'tests');
    
    container.innerHTML = renderTestingLog(data, _state);
    
    // 🔥 AUTO-MOUNT!
    mount(container);
    
  } catch (error) {
    console.error('[TestingLog] ❌ Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Testing Log konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export function mount(container) {
  _root = container || _root;
  
  // Cleanup old listeners
  if (_mounted && _root) {
    _root.removeEventListener('input', onInput);
    _root.removeEventListener('change', onChange);
    _root.removeEventListener('click', onClick);
  }
  
  if (!_root) return;
  
  console.log('[TestingLog] 🎯 Mounting event listeners...');
  
  _root.addEventListener('input', onInput);
  _root.addEventListener('change', onChange);
  _root.addEventListener('click', onClick);
  
  _mounted = true;
  console.log('[TestingLog] ✅ Mounted successfully');
}

export async function destroy(container) {
  const r = container || _root;
  if (r) {
    r.removeEventListener('input', onInput);
    r.removeEventListener('change', onChange);
    r.removeEventListener('click', onClick);
    r.innerHTML = '';
  }
  
  unloadModuleCSS();
  
  _root = null;
  _moduleData = null;
  _state = null;
  _mounted = false;
  filters = { outcome: 'all', search: '', sort: 'date-desc' };
  
  console.log('[TestingLog] 🧹 Destroyed');
}

/* ==================== RENDERING ==================== */

function renderTestingLog(data, state) {
  const filtered = filterTests(data.tests);
  const sorted = sortTests(filtered);
  
  const brandName = state.selectedBrand?.name || 'Brand';
  
  // Summary stats
  const totalTests = data.tests.length;
  const winnersCount = data.tests.filter(t => t.winner).length;
  const inconclusiveCount = data.tests.filter(t => !t.winner).length;
  const avgDelta = data.tests
    .filter(t => t.winner)
    .reduce((sum, t) => {
      const winnerRoas = t.winner === 'A' ? t.roasA : t.roasB;
      const loserRoas = t.winner === 'A' ? t.roasB : t.roasA;
      const delta = ((winnerRoas - loserRoas) / loserRoas * 100);
      return sum + delta;
    }, 0) / (winnersCount || 1);
  
  return `
    <div class="testinglog-container">
      
      <!-- HEADER -->
      <div class="testinglog-header">
        <div>
          <h1 class="testinglog-title">🧪 Testing Log</h1>
          <p class="testinglog-subtitle">${brandName} • ${sorted.length} Tests</p>
        </div>
        <button id="newTestBtn" class="tl-btn-primary">
          <span>➕ Neuer Test</span>
        </button>
      </div>
      
      <!-- SUMMARY -->
      <div class="tl-summary">
        <div class="tl-summary-card">
          <div class="tl-summary-label">Gesamt Tests</div>
          <div class="tl-summary-value">${totalTests}</div>
        </div>
        <div class="tl-summary-card">
          <div class="tl-summary-label">🏆 Winners</div>
          <div class="tl-summary-value">${winnersCount}</div>
        </div>
        <div class="tl-summary-card">
          <div class="tl-summary-label">🤷 Inconclusive</div>
          <div class="tl-summary-value">${inconclusiveCount}</div>
        </div>
        <div class="tl-summary-card">
          <div class="tl-summary-label">Ø Performance Lift</div>
          <div class="tl-summary-value">+${avgDelta.toFixed(0)}%</div>
        </div>
      </div>
      
      <!-- FILTERS -->
      <div class="tl-filters">
        <div class="tl-filter-group">
          <input 
            type="text" 
            id="searchInput" 
            class="tl-search-input" 
            placeholder="🔍 Test oder Creative suchen..."
            value="${filters.search}"
          />
        </div>
        
        <div class="tl-filter-group">
          <select id="filterOutcome" class="tl-filter-select">
            <option value="all" ${filters.outcome === 'all' ? 'selected' : ''}>Alle Tests</option>
            <option value="winner" ${filters.outcome === 'winner' ? 'selected' : ''}>🏆 Winners Only</option>
            <option value="inconclusive" ${filters.outcome === 'inconclusive' ? 'selected' : ''}>🤷 Inconclusive</option>
          </select>
        </div>
        
        <div class="tl-filter-group">
          <select id="filterSort" class="tl-filter-select">
            <option value="date-desc" ${filters.sort === 'date-desc' ? 'selected' : ''}>Datum (Neueste zuerst)</option>
            <option value="delta-desc" ${filters.sort === 'delta-desc' ? 'selected' : ''}>Performance Lift ↓</option>
            <option value="roas-desc" ${filters.sort === 'roas-desc' ? 'selected' : ''}>Winner ROAS ↓</option>
          </select>
        </div>
      </div>
      
      <!-- TESTS GRID -->
      <div class="tests-grid" data-tests-grid>
        ${sorted.length > 0 ? sorted.map(test => renderTestCard(test)).join('') : renderNoResults()}
      </div>
      
    </div>
  `;
}

function renderTestCard(test) {
  if (!test.winner) {
    return renderInconclusiveCard(test);
  }
  
  const winnerRoas = test.winner === 'A' ? test.roasA : test.roasB;
  const loserRoas = test.winner === 'A' ? test.roasB : test.roasA;
  const winnerName = test.winner === 'A' ? test.creativeA : test.creativeB;
  const loserName = test.winner === 'A' ? test.creativeB : test.creativeA;
  const delta = ((winnerRoas - loserRoas) / loserRoas * 100).toFixed(0);
  
  return `
    <div class="test-card" data-test-id="${test.id}" role="button" tabindex="0">
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
      
      <div class="test-result positive">
        <span class="result-icon">📈</span>
        <span class="result-text">+${delta}% Performance Lift</span>
      </div>
      
      <div class="test-reason">
        <strong>Insight:</strong> ${test.reason || 'Keine Notiz'}
      </div>
      
    </div>
  `;
}

function renderInconclusiveCard(test) {
  return `
    <div class="test-card inconclusive" data-test-id="${test.id}" role="button" tabindex="0">
      <div class="test-date">📅 ${test.date}</div>
      
      <div class="test-comparison">
        
        <div class="test-creative">
          <div class="creative-name">${test.creativeA}</div>
          <div class="creative-roas">${test.roasA}x ROAS</div>
        </div>
        
        <div class="test-vs">vs</div>
        
        <div class="test-creative">
          <div class="creative-name">${test.creativeB}</div>
          <div class="creative-roas">${test.roasB}x ROAS</div>
        </div>
        
      </div>
      
      <div class="test-result neutral">
        <span class="result-icon">🤷</span>
        <span class="result-text">Inconclusive – Kein klarer Winner</span>
      </div>
      
      <div class="test-reason">
        <strong>Notiz:</strong> ${test.reason || 'Test zu früh beendet oder zu wenig Daten'}
      </div>
      
    </div>
  `;
}

function renderNoResults() {
  return `
    <div class="tl-empty">
      <div class="tl-empty-icon">🔍</div>
      <div class="tl-empty-title">Keine Tests gefunden</div>
      <div class="tl-empty-text">Passe deine Filter an oder erstelle einen neuen Test.</div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div style="text-align: center; padding: 6rem 2rem;">
      <div style="font-size: 4rem; margin-bottom: 1.5rem;">🧪</div>
      <h2 style="font-size: 1.75rem; color: #1d1d1f; margin-bottom: 1rem; font-weight: 800;">Noch keine Tests durchgeführt</h2>
      <p style="color: #6b7280; font-size: 1rem; margin-bottom: 2rem;">Starte deinen ersten A/B Test um deine Creatives zu optimieren.</p>
      <button id="newTestBtn" style="
        padding: 14px 28px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #4F80FF 0%, #8B5CF6 100%);
        color: white;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
      ">
        ➕ Ersten Test starten
      </button>
    </div>
  `;
}

function renderGridOnly() {
  if (!_root || !_moduleData) return;
  
  console.log('[TestingLog] 🔄 Updating grid...');
  
  const filtered = filterTests(_moduleData.tests);
  const sorted = sortTests(filtered);
  
  console.log('[TestingLog] 🧪 Showing', sorted.length, '/', _moduleData.tests.length, 'tests');
  
  const grid = _root.querySelector('[data-tests-grid]');
  if (grid) {
    grid.innerHTML = sorted.length > 0 ? sorted.map(test => renderTestCard(test)).join('') : renderNoResults();
  }
}

/* ==================== FILTERING & SORTING ==================== */

function filterTests(tests) {
  return tests.filter(t => {
    // Outcome filter
    if (filters.outcome === 'winner' && !t.winner) return false;
    if (filters.outcome === 'inconclusive' && t.winner) return false;
    
    // Search filter
    if (filters.search) {
      const hay = [
        t.creativeA,
        t.creativeB,
        t.reason,
        t.date
      ].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(filters.search.toLowerCase())) return false;
    }
    
    return true;
  });
}

function sortTests(tests) {
  const sorted = [...tests];
  
  switch (filters.sort) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    case 'delta-desc':
      return sorted.sort((a, b) => {
        const deltaA = a.winner ? ((a.winner === 'A' ? a.roasA : a.roasB) - (a.winner === 'A' ? a.roasB : a.roasA)) : 0;
        const deltaB = b.winner ? ((b.winner === 'A' ? b.roasA : b.roasB) - (b.winner === 'A' ? b.roasB : b.roasA)) : 0;
        return deltaB - deltaA;
      });
    
    case 'roas-desc':
      return sorted.sort((a, b) => {
        const winnerRoasA = a.winner ? (a.winner === 'A' ? a.roasA : a.roasB) : Math.max(a.roasA, a.roasB);
        const winnerRoasB = b.winner ? (b.winner === 'A' ? b.roasA : b.roasB) : Math.max(b.roasA, b.roasB);
        return winnerRoasB - winnerRoasA;
      });
    
    default:
      return sorted;
  }
}

/* ==================== EVENTS ==================== */

function onInput(e) {
  const t = e.target;
  if (!t) return;
  
  if (t.id === 'searchInput') {
    console.log('[TestingLog] 🔍 Search:', t.value);
    filters.search = t.value;
    renderGridOnly();
  }
}

function onChange(e) {
  const t = e.target;
  if (!t) return;
  
  if (t.id === 'filterOutcome') {
    console.log('[TestingLog] 🎯 Outcome filter:', t.value);
    filters.outcome = t.value;
    renderGridOnly();
  }
  
  if (t.id === 'filterSort') {
    console.log('[TestingLog] 📈 Sort:', t.value);
    filters.sort = t.value;
    renderGridOnly();
  }
}

function onClick(e) {
  const t = e.target;
  if (!t) return;
  
  // New test button
  if (t.closest('#newTestBtn')) {
    console.log('[TestingLog] ➕ New test clicked');
    CoreAPI.toast('Test-Editor kommt in P2.2 (AB Testing Module)', 'info');
    return;
  }
  
  // Test card click
  const card = t.closest('.test-card');
  if (card) {
    const id = card.dataset.testId;
    console.log('[TestingLog] 👁️ Clicked test:', id);
    CoreAPI.toast('Test-Details öffnen...', 'info');
  }
}

/* ==================== HELPERS ==================== */

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
