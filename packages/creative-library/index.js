/**
 * SignalOne - Creative Library V7.0 VISUAL GRID
 * Data-Rich Cards | Elite Design | Maximum Density
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'creativeLibrary',
  label: 'Creative Library',
  requiresData: true
};

let moduleData = null;
let currentFilters = { status: 'all', sortBy: 'roas', viewMode: 'grid' };

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Creative Library...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    const creatives = await DataLayer.fetchCreatives(state.selectedBrand, null, state.selectedCampaign);
    
    if (!creatives || creatives.length === 0) {
      throw new Error('Keine Creatives verfügbar');
    }
    
    moduleData = { creatives };
    
    container.innerHTML = renderCreativeLibrary(creatives, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[Creative Library] Error:', error);
    container.innerHTML = `<div style="text-align: center; padding: 4rem; color: #ef4444;">${error.message}</div>`;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
  currentFilters = { status: 'all', sortBy: 'roas', viewMode: 'grid' };
}

function renderCreativeLibrary(creatives, state) {
  const filtered = filterAndSortCreatives(creatives, currentFilters);
  
  return `
    <div class="creative-library-v7">
      
      <!-- HEADER BAR -->
      <div class="library-header-v7">
        <div class="header-title-v7">
          <h1>Creative Library</h1>
          <span class="count-badge-v7">${filtered.length} Creatives</span>
        </div>
        <div class="header-actions-v7">
          <input type="text" id="searchCreatives" placeholder="Search creatives..." class="search-input-v7" />
          <select id="statusFilter" class="filter-select-v7">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
          <select id="sortBy" class="filter-select-v7">
            <option value="roas">Sort by ROAS</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="ctr">Sort by CTR</option>
            <option value="spend">Sort by Spend</option>
          </select>
          <div class="view-toggle-v7">
            <button class="toggle-btn-v7 ${currentFilters.viewMode === 'grid' ? 'active' : ''}" data-view="grid">Grid</button>
            <button class="toggle-btn-v7 ${currentFilters.viewMode === 'list' ? 'active' : ''}" data-view="list">List</button>
          </div>
        </div>
      </div>
      
      <!-- MAIN CONTENT -->
      <div class="library-content-v7">
        
        <!-- SIDEBAR FILTERS -->
        <div class="library-sidebar-v7">
          <div class="filter-group-v7">
            <div class="filter-title-v7">ROAS Range</div>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="high" /> 5.0x+
            </label>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="medium" /> 3.0x - 4.9x
            </label>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="low" /> < 3.0x
            </label>
          </div>
          
          <div class="filter-group-v7">
            <div class="filter-title-v7">Budget</div>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="high-budget" /> €5K+
            </label>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="medium-budget" /> €1K - €5K
            </label>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="low-budget" /> < €1K
            </label>
          </div>
          
          <div class="filter-group-v7">
            <div class="filter-title-v7">Status</div>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="active" checked /> Active
            </label>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="paused" /> Paused
            </label>
            <label class="filter-checkbox-v7">
              <input type="checkbox" value="draft" /> Draft
            </label>
          </div>
        </div>
        
        <!-- GRID -->
        <div class="library-grid-v7 ${currentFilters.viewMode === 'list' ? 'list-mode' : ''}">
          ${filtered.map(creative => renderCreativeCard(creative)).join('')}
        </div>
        
      </div>
      
    </div>
  `;
}

function renderCreativeCard(creative) {
  const performancePercent = Math.min(100, (creative.roas / 8.0) * 100);
  const statusClass = creative.status === 'active' ? 'status-active' : creative.status === 'paused' ? 'status-paused' : 'status-draft';
  
  return `
    <div class="creative-card-v7" data-id="${creative.id}">
      <div class="card-thumbnail-v7">
        <img src="${creative.thumbnail}" alt="${creative.name}" loading="lazy" />
        <div class="card-overlay-v7">
          <div class="overlay-stats-v7">
            <div class="stat-row-v7">
              <span>Impressions</span>
              <span>${formatNumber(creative.impressions)}</span>
            </div>
            <div class="stat-row-v7">
              <span>Clicks</span>
              <span>${formatNumber(creative.clicks)}</span>
            </div>
            <div class="stat-row-v7">
              <span>Spend</span>
              <span>${formatCurrency(creative.spend)}</span>
            </div>
          </div>
        </div>
        <div class="status-badge-v7 ${statusClass}">${creative.status}</div>
      </div>
      
      <div class="card-content-v7">
        <div class="card-name-v7">${creative.name}</div>
        
        <div class="card-metrics-v7">
          <div class="metric-item-v7">
            <span class="metric-label-v7">ROAS</span>
            <span class="metric-value-v7">${formatRoas(creative.roas)}</span>
          </div>
          <div class="metric-item-v7">
            <span class="metric-label-v7">Revenue</span>
            <span class="metric-value-v7">${formatCurrency(creative.revenue)}</span>
          </div>
          <div class="metric-item-v7">
            <span class="metric-label-v7">CTR</span>
            <span class="metric-value-v7">${creative.ctr.toFixed(2)}%</span>
          </div>
          <div class="metric-item-v7">
            <span class="metric-label-v7">CPM</span>
            <span class="metric-value-v7">${formatCurrency(creative.cpm)}</span>
          </div>
        </div>
        
        <div class="card-performance-v7">
          <div class="performance-bar-v7">
            <div class="performance-fill-v7" style="width: ${performancePercent}%;"></div>
          </div>
          <div class="performance-label-v7">${performancePercent.toFixed(0)}% Performance</div>
        </div>
        
        <div class="card-actions-v7">
          <button class="action-btn-v7 btn-scale" data-action="scale" data-id="${creative.id}">
            ${creative.status === 'active' ? 'Scale' : 'Activate'}
          </button>
          <button class="action-btn-v7 btn-pause" data-action="pause" data-id="${creative.id}">
            ${creative.status === 'active' ? 'Pause' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function filterAndSortCreatives(creatives, filters) {
  let filtered = [...creatives];
  
  if (filters.status !== 'all') {
    filtered = filtered.filter(c => c.status === filters.status);
  }
  
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'roas': return b.roas - a.roas;
      case 'revenue': return b.revenue - a.revenue;
      case 'ctr': return b.ctr - a.ctr;
      case 'spend': return b.spend - a.spend;
      default: return b.roas - a.roas;
    }
  });
  
  return filtered;
}

function bindEvents(container) {
  const statusFilter = container.querySelector('#statusFilter');
  const sortBy = container.querySelector('#sortBy');
  const viewToggles = container.querySelectorAll('.toggle-btn-v7');
  
  if (statusFilter) {
    statusFilter.value = currentFilters.status;
    statusFilter.addEventListener('change', (e) => {
      currentFilters.status = e.target.value;
      render(container);
    });
  }
  
  if (sortBy) {
    sortBy.value = currentFilters.sortBy;
    sortBy.addEventListener('change', (e) => {
      currentFilters.sortBy = e.target.value;
      render(container);
    });
  }
  
  viewToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilters.viewMode = btn.dataset.view;
      render(container);
    });
  });
  
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      handleAction(action, id);
    });
  });
}

function handleAction(action, id) {
  switch (action) {
    case 'scale':
      CoreAPI.showToast(`Scale creative ${id}...`, 'info');
      break;
    case 'pause':
      CoreAPI.showToast(`Pause creative ${id}...`, 'warning');
      break;
  }
}

function formatCurrency(value) {
  if (!value) return '€0';
  return `€${Math.round(value).toLocaleString('de-DE')}`;
}

function formatRoas(value) {
  if (!value) return '0.0x';
  return `${Number(value).toFixed(1)}x`;
}

function formatNumber(value) {
  if (!value) return '0';
  return Math.round(value).toLocaleString('de-DE');
}

function loadModuleCSS() {
  if (document.getElementById('creative-library-module-css')) return;
  const link = document.createElement('link');
  link.id = 'creative-library-module-css';
  link.rel = 'stylesheet';
  link.href = '/packages/creative-library/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('creative-library-module-css');
  if (link) link.remove();
}
