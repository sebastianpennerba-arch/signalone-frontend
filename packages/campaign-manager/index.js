/**
 * SignalOne - Campaign Manager V7.0 DATA TABLE
 * Inline Metrics | Status Management | Elite Design
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'campaignManager',
  label: 'Campaign Manager',
  requiresData: true
};

let moduleData = null;

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Campaign Manager...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    const campaigns = await DataLayer.fetchCampaigns(state.selectedBrand, null);
    
    if (!campaigns || campaigns.length === 0) {
      throw new Error('Keine Campaigns verfügbar');
    }
    
    moduleData = { campaigns };
    
    container.innerHTML = renderCampaignManager(campaigns, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[Campaign Manager] Error:', error);
    container.innerHTML = `<div style="text-align: center; padding: 4rem; color: #ef4444;">${error.message}</div>`;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
}

function renderCampaignManager(campaigns, state) {
  return `
    <div class="campaign-manager-v7">
      
      <div class="cm-header-v7">
        <h1>Campaign Manager</h1>
        <button class="btn-create-v7" data-action="create">+ New Campaign</button>
      </div>
      
      <div class="cm-table-container-v7">
        <table class="cm-table-v7">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Status</th>
              <th>Spend</th>
              <th>Revenue</th>
              <th>ROAS</th>
              <th>CTR</th>
              <th>Performance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${campaigns.map(campaign => renderCampaignRow(campaign)).join('')}
          </tbody>
        </table>
      </div>
      
    </div>
  `;
}

function renderCampaignRow(campaign) {
  const performancePercent = Math.min(100, (campaign.roas / 6.0) * 100);
  const statusClass = campaign.status === 'active' ? 'status-active' : 'status-paused';
  
  return `
    <tr class="cm-row-v7" data-id="${campaign.id}">
      <td>
        <div class="campaign-name-v7">${campaign.name}</div>
        <div class="campaign-meta-v7">${campaign.adCount || 0} Ads</div>
      </td>
      <td>
        <span class="status-badge-cm-v7 ${statusClass}">${campaign.status}</span>
      </td>
      <td class="metric-cell-v7">${formatCurrency(campaign.spend)}</td>
      <td class="metric-cell-v7">${formatCurrency(campaign.revenue)}</td>
      <td class="metric-cell-v7 roas-cell-v7">${formatRoas(campaign.roas)}</td>
      <td class="metric-cell-v7">${campaign.ctr?.toFixed(2)}%</td>
      <td>
        <div class="performance-inline-v7">
          <div class="perf-bar-v7">
            <div class="perf-fill-v7" style="width: ${performancePercent}%;"></div>
          </div>
          <span class="perf-percent-v7">${performancePercent.toFixed(0)}%</span>
        </div>
      </td>
      <td>
        <div class="row-actions-v7">
          <button class="row-btn-v7" data-action="edit" data-id="${campaign.id}">Edit</button>
          <button class="row-btn-v7" data-action="pause" data-id="${campaign.id}">
            ${campaign.status === 'active' ? 'Pause' : 'Activate'}
          </button>
        </div>
      </td>
    </tr>
  `;
}

function bindEvents(container) {
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
    case 'create':
      CoreAPI.showToast('Create new campaign...', 'info');
      break;
    case 'edit':
      CoreAPI.showToast(`Edit campaign ${id}...`, 'info');
      break;
    case 'pause':
      CoreAPI.showToast(`Toggle campaign ${id} status...`, 'warning');
      break;
  }
}

function formatCurrency(value) {
  return value ? `€${Math.round(value).toLocaleString('de-DE')}` : '€0';
}

function formatRoas(value) {
  return value ? `${Number(value).toFixed(1)}x` : '0.0x';
}

function loadModuleCSS() {
  if (document.getElementById('campaign-manager-module-css')) return;
  const link = document.createElement('link');
  link.id = 'campaign-manager-module-css';
  link.rel = 'stylesheet';
  link.href = '/packages/campaign-manager/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('campaign-manager-module-css');
  if (link) link.remove();
}
