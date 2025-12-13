/**
 * SignalOne - Campaigns Module
 * 
 * Features:
 * - Table view mit allen Kampagnen
 * - Status filter (Active, Paused, All)
 * - KPIs: Spend, Revenue, ROAS, CTR
 * - Search & Sort
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'campaigns',
  label: 'Campaigns',
  requiresData: true
};

let moduleData = null;
let filters = {
  status: 'all',
  search: '',
  sort: 'spend-desc'
};

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Campaigns...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    
    const campaigns = await DataLayer.fetchCampaigns(
      state.selectedBrand,
      null
    );
    
    if (!campaigns || campaigns.length === 0) {
      throw new Error('Keine Kampagnen verfügbar');
    }
    
    moduleData = campaigns;
    
    container.innerHTML = renderCampaigns(campaigns, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[Campaigns] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Campaigns konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
  filters = { status: 'all', search: '', sort: 'spend-desc' };
}

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
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="paused">Pausiert</option>
          </select>
        </div>
        
        <div class="filter-group">
          <select id="filterSort" class="filter-select">
            <option value="spend-desc">Spend (Höchster zuerst)</option>
            <option value="roas-desc">ROAS (Höchster zuerst)</option>
            <option value="revenue-desc">Revenue (Höchster zuerst)</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>
      
      <!-- TABLE -->
      <div class="campaigns-table-wrapper">
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
      </div>
      
    </div>
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

function formatCurrency(value) {
  if (!value) return '0€';
  return `${Math.round(value).toLocaleString('de-DE')}€`;
}

function bindEvents(container) {
  const searchInput = container.querySelector('#searchInput');
  const filterStatus = container.querySelector('#filterStatus');
  const filterSort = container.querySelector('#filterSort');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search = e.target.value;
      render(container);
    });
  }
  
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      filters.status = e.target.value;
      render(container);
    });
  }
  
  if (filterSort) {
    filterSort.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      render(container);
    });
  }
  
  // Campaign row click
  const rows = container.querySelectorAll('.campaign-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.campaignId;
      CoreAPI.toast(`Campaign Details: ${id}`, 'info');
    });
  });
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
