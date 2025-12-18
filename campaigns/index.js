/**
 * SignalOne - Campaigns Module V2.0
 * 
 * 🔥 FIXED:
 * - Filters work without infinite loop
 * - Clean mount/destroy pattern
 * - Proper event listener management
 * - Console debugging
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'campaigns',
  label: 'Campaigns',
  requiresData: true
};

let _root = null;
let _moduleData = null;
let _state = null;
let _mounted = false;

let filters = {
  status: 'all',
  search: '',
  sort: 'spend-desc'
};

export async function render(container) {
  _root = container;
  
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">📦 Lade Campaigns...</div>';
    
    loadModuleCSS();
    
    _state = CoreAPI.getState();
    
    const campaigns = await DataLayer.fetchCampaigns(
      _state.selectedBrand,
      null
    );
    
    if (!campaigns || campaigns.length === 0) {
      throw new Error('Keine Kampagnen verfügbar');
    }
    
    _moduleData = campaigns;
    
    console.log('[Campaigns] 📊 Loaded', campaigns.length, 'campaigns');
    
    container.innerHTML = renderCampaigns(campaigns, _state);
    
    // 🔥 AUTO-MOUNT!
    mount(container);
    
  } catch (error) {
    console.error('[Campaigns] ❌ Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Campaigns konnte nicht geladen werden</h2>
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
  
  console.log('[Campaigns] 🎯 Mounting event listeners...');
  
  _root.addEventListener('input', onInput);
  _root.addEventListener('change', onChange);
  _root.addEventListener('click', onClick);
  
  _mounted = true;
  console.log('[Campaigns] ✅ Mounted successfully');
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
  filters = { status: 'all', search: '', sort: 'spend-desc' };
  
  console.log('[Campaigns] 🧹 Destroyed');
}

/* ==================== RENDERING ==================== */

function renderCampaigns(campaigns, state) {
  const filtered = filterCampaigns(campaigns);
  const sorted = sortCampaigns(filtered);
  
  const brandName = state.selectedBrand?.name || 'Brand';
  
  // Summary stats
  const totalSpend = sorted.reduce((sum, c) => sum + c.spend30d, 0);
  const totalRevenue = sorted.reduce((sum, c) => sum + c.revenue30d, 0);
  const avgRoas = totalRevenue / totalSpend;
  const activeCount = sorted.filter(c => c.status === 'active').length;
  const pausedCount = sorted.filter(c => c.status === 'paused').length;
  
  return `
    <div class="campaigns-container">
      
      <!-- HEADER -->
      <div class="campaigns-header">
        <div>
          <h1 class="campaigns-title">⚡ Campaigns</h1>
          <p class="campaigns-subtitle">${brandName} • ${sorted.length} Kampagnen</p>
        </div>
      </div>
      
      <!-- SUMMARY -->
      <div class="campaigns-summary">
        <div class="summary-card">
          <div class="summary-label">Gesamt Spend</div>
          <div class="summary-value">${formatCurrency(totalSpend)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Gesamt Revenue</div>
          <div class="summary-value">${formatCurrency(totalRevenue)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Ø ROAS</div>
          <div class="summary-value">${avgRoas.toFixed(1)}x</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Aktiv / Pausiert</div>
          <div class="summary-value">${activeCount} / ${pausedCount}</div>
        </div>
      </div>
      
      <!-- FILTERS -->
      <div class="campaigns-filters">
        <div class="filter-group">
          <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="🔍 Kampagne suchen..."
            value="${filters.search}"
          />
        </div>
        
        <div class="filter-group">
          <select id="filterStatus" class="filter-select">
            <option value="all" ${filters.status === 'all' ? 'selected' : ''}>Alle Status</option>
            <option value="active" ${filters.status === 'active' ? 'selected' : ''}>Aktiv</option>
            <option value="paused" ${filters.status === 'paused' ? 'selected' : ''}>Pausiert</option>
          </select>
        </div>
        
        <div class="filter-group">
          <select id="filterSort" class="filter-select">
            <option value="spend-desc" ${filters.sort === 'spend-desc' ? 'selected' : ''}>Spend (Höchster zuerst)</option>
            <option value="roas-desc" ${filters.sort === 'roas-desc' ? 'selected' : ''}>ROAS (Höchster zuerst)</option>
            <option value="revenue-desc" ${filters.sort === 'revenue-desc' ? 'selected' : ''}>Revenue (Höchster zuerst)</option>
            <option value="name-asc" ${filters.sort === 'name-asc' ? 'selected' : ''}>Name (A-Z)</option>
          </select>
        </div>
      </div>
      
      <!-- TABLE -->
      <div class="campaigns-table-wrapper" data-table-wrapper>
        ${renderTable(sorted)}
      </div>
      
    </div>
  `;
}

function renderTable(sorted) {
  return `
    <table class="campaigns-table">
      <thead>
        <tr>
          <th>Kampagne</th>
          <th>Status</th>
          <th>Objective</th>
          <th>Spend (30d)</th>
          <th>Revenue (30d)</th>
          <th>ROAS</th>
          <th>CTR</th>
          <th>Conversions</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(campaign => renderCampaignRow(campaign)).join('')}
      </tbody>
    </table>
  `;
}

function renderCampaignRow(campaign) {
  const statusClass = campaign.status === 'active' ? 'status-active' : 'status-paused';
  const roasColor = campaign.roas >= 4.0 ? '#10b981' : campaign.roas >= 3.0 ? '#f59e0b' : '#ef4444';
  
  return `
    <tr class="campaign-row" data-campaign-id="${campaign.id}">
      <td class="campaign-name">
        <div class="name-main">${campaign.name}</div>
        <div class="name-sub">Budget: ${formatCurrency(campaign.dailyBudget)}/Tag</div>
      </td>
      <td>
        <span class="campaign-status ${statusClass}">${campaign.status === 'active' ? 'Aktiv' : 'Pausiert'}</span>
      </td>
      <td class="campaign-objective">${campaign.objective}</td>
      <td class="campaign-spend">${formatCurrency(campaign.spend30d)}</td>
      <td class="campaign-revenue">${formatCurrency(campaign.revenue30d)}</td>
      <td class="campaign-roas" style="color: ${roasColor}; font-weight: 700;">${campaign.roas}x</td>
      <td class="campaign-ctr">${campaign.ctr}%</td>
      <td class="campaign-conversions">${campaign.conversions}</td>
    </tr>
  `;
}

function renderTableOnly() {
  if (!_root || !_moduleData) return;
  
  console.log('[Campaigns] 🔄 Updating table...');
  
  const filtered = filterCampaigns(_moduleData);
  const sorted = sortCampaigns(filtered);
  
  console.log('[Campaigns] 📊 Showing', sorted.length, '/', _moduleData.length, 'campaigns');
  
  const wrapper = _root.querySelector('[data-table-wrapper]');
  if (wrapper) {
    wrapper.innerHTML = renderTable(sorted);
  }
}

/* ==================== FILTERING & SORTING ==================== */

function filterCampaigns(campaigns) {
  return campaigns.filter(c => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

function sortCampaigns(campaigns) {
  const sorted = [...campaigns];
  
  switch (filters.sort) {
    case 'spend-desc':
      return sorted.sort((a, b) => b.spend30d - a.spend30d);
    case 'roas-desc':
      return sorted.sort((a, b) => b.roas - a.roas);
    case 'revenue-desc':
      return sorted.sort((a, b) => b.revenue30d - a.revenue30d);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

/* ==================== EVENTS ==================== */

function onInput(e) {
  const t = e.target;
  if (!t) return;
  
  if (t.id === 'searchInput') {
    console.log('[Campaigns] 🔍 Search:', t.value);
    filters.search = t.value;
    renderTableOnly();
  }
}

function onChange(e) {
  const t = e.target;
  if (!t) return;
  
  if (t.id === 'filterStatus') {
    console.log('[Campaigns] 🎯 Status filter:', t.value);
    filters.status = t.value;
    renderTableOnly();
  }
  
  if (t.id === 'filterSort') {
    console.log('[Campaigns] 📈 Sort:', t.value);
    filters.sort = t.value;
    renderTableOnly();
  }
}

function onClick(e) {
  const t = e.target;
  if (!t) return;
  
  const row = t.closest?.('.campaign-row');
  if (row) {
    const id = row.dataset.campaignId;
    const campaign = _moduleData?.find(c => c.id === id);
    if (campaign) {
      console.log('[Campaigns] 👁️ Clicked:', campaign.name);
      CoreAPI.toast(`Campaign Details: ${campaign.name}`, 'info');
    }
  }
}

/* ==================== HELPERS ==================== */

function formatCurrency(value) {
  if (!value) return '0€';
  return `${Math.round(value).toLocaleString('de-DE')}€`;
}

function loadModuleCSS() {
  if (document.getElementById('campaigns-css')) return;
  const link = document.createElement('link');
  link.id = 'campaigns-css';
  link.rel = 'stylesheet';
  link.href = '/packages/campaigns/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('campaigns-css');
  if (link) link.remove();
}
