/**
 * SignalOne - Creative Library Module
 * 
 * Features:
 * - Grid view mit Thumbnails
 * - Filter: Status, Type, Campaign
 * - Sortierung: ROAS, Spend, Date
 * - Detail-View Modal
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'creativeLibrary',
  label: 'Creative Library',
  requiresData: true
};

let moduleData = null;
let filters = {
  status: 'all',
  type: 'all',
  campaign: 'all',
  sort: 'roas-desc'
};

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Creative Library...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    
    const creatives = await DataLayer.fetchCreatives(
      state.selectedBrand,
      null,
      state.selectedCampaign
    );
    
    if (!creatives || creatives.length === 0) {
      throw new Error('Keine Creatives verfügbar');
    }
    
    moduleData = creatives;
    
    container.innerHTML = renderCreativeLibrary(creatives, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[CreativeLibrary] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Creative Library konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
  filters = { status: 'all', type: 'all', campaign: 'all', sort: 'roas-desc' };
}

function renderCreativeLibrary(creatives, state) {
  const filtered = filterCreatives(creatives);
  const sorted = sortCreatives(filtered);
  
  const brandName = state.selectedBrand?.name || 'Brand';
  const campaignName = state.selectedCampaign?.name || 'Alle Kampagnen';
  
  return `
    <div class="creative-library-container">
      
      <!-- HEADER -->
      <div class="creative-library-header">
        <div>
          <h1 class="creative-library-title">🎨 Creative Library</h1>
          <p class="creative-library-subtitle">${brandName} • ${campaignName} • ${sorted.length} Creatives</p>
        </div>
      </div>
      
      <!-- FILTERS -->
      <div class="creative-filters">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select id="filterStatus" class="filter-select">
            <option value="all">Alle</option>
            <option value="winner">Winner</option>
            <option value="scaling">Scaling</option>
            <option value="testing">Testing</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Type</label>
          <select id="filterType" class="filter-select">
            <option value="all">Alle</option>
            <option value="UGC">UGC</option>
            <option value="Product Shot">Product Shot</option>
            <option value="Founder Story">Founder Story</option>
            <option value="Testimonial">Testimonial</option>
            <option value="Brand Content">Brand Content</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Sortierung</label>
          <select id="filterSort" class="filter-select">
            <option value="roas-desc">ROAS (Höchste zuerst)</option>
            <option value="roas-asc">ROAS (Niedrigste zuerst)</option>
            <option value="spend-desc">Spend (Höchster zuerst)</option>
            <option value="spend-asc">Spend (Niedrigster zuerst)</option>
            <option value="date-desc">Datum (Neueste zuerst)</option>
          </select>
        </div>
      </div>
      
      <!-- GRID -->
      <div class="creative-grid">
        ${sorted.map(creative => renderCreativeCard(creative)).join('')}
      </div>
      
    </div>
  `;
}

function renderCreativeCard(creative) {
  const statusClass = `status-${creative.status}`;
  const roasColor = creative.roas >= 5.0 ? '#10b981' : creative.roas >= 3.0 ? '#f59e0b' : '#ef4444';
  
  return `
    <div class="creative-card" data-creative-id="${creative.id}">
      
      <!-- THUMBNAIL -->
      <div class="creative-thumbnail">
        <img src="${creative.thumbnail}" alt="${creative.name}" loading="lazy" />
        <div class="creative-status-badge ${statusClass}">${creative.status}</div>
      </div>
      
      <!-- INFO -->
      <div class="creative-info">
        <div class="creative-name">${creative.name}</div>
        <div class="creative-meta">${creative.format} • ${creative.type}</div>
        
        <!-- KPIs -->
        <div class="creative-kpis">
          <div class="creative-kpi">
            <span class="kpi-label">ROAS</span>
            <span class="kpi-value" style="color: ${roasColor}; font-weight: 700;">${creative.roas}x</span>
          </div>
          <div class="creative-kpi">
            <span class="kpi-label">Spend</span>
            <span class="kpi-value">${formatCurrency(creative.spend)}</span>
          </div>
          <div class="creative-kpi">
            <span class="kpi-label">Revenue</span>
            <span class="kpi-value">${formatCurrency(creative.revenue)}</span>
          </div>
        </div>
        
        <!-- CAMPAIGN -->
        <div class="creative-campaign">🎯 ${creative.campaignName}</div>
      </div>
      
    </div>
  `;
}

function filterCreatives(creatives) {
  return creatives.filter(c => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.type !== 'all' && c.type !== filters.type) return false;
    return true;
  });
}

function sortCreatives(creatives) {
  const sorted = [...creatives];
  
  switch (filters.sort) {
    case 'roas-desc':
      return sorted.sort((a, b) => b.roas - a.roas);
    case 'roas-asc':
      return sorted.sort((a, b) => a.roas - b.roas);
    case 'spend-desc':
      return sorted.sort((a, b) => b.spend - a.spend);
    case 'spend-asc':
      return sorted.sort((a, b) => a.spend - b.spend);
    case 'date-desc':
      return sorted.sort((a, b) => b.daysActive - a.daysActive);
    default:
      return sorted;
  }
}

function formatCurrency(value) {
  if (!value) return '0€';
  return `${Math.round(value).toLocaleString('de-DE')}€`;
}

function bindEvents(container) {
  const filterStatus = container.querySelector('#filterStatus');
  const filterType = container.querySelector('#filterType');
  const filterSort = container.querySelector('#filterSort');
  
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      filters.status = e.target.value;
      render(container);
    });
  }
  
  if (filterType) {
    filterType.addEventListener('change', (e) => {
      filters.type = e.target.value;
      render(container);
    });
  }
  
  if (filterSort) {
    filterSort.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      render(container);
    });
  }
  
  // Creative cards click
  const cards = container.querySelectorAll('.creative-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.creativeId;
      CoreAPI.toast(`Creative Details: ${id}`, 'info');
    });
  });
}

function loadModuleCSS() {
  if (document.getElementById('creative-library-css')) return;
  const link = document.createElement('link');
  link.id = 'creative-library-css';
  link.rel = 'stylesheet';
  link.href = '/packages/creativeLibrary/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('creative-library-css');
  if (link) link.remove();
}
