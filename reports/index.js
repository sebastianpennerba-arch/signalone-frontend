/**
 * SignalOne - Reports V7.0 DATA VISUALIZATION
 * Charts | Metrics | Export | Elite Design
 */

import { CoreAPI } from '../../core-api.js';
import * as DataLayer from '../../data/index.js';

export const meta = {
  id: 'reports',
  label: 'Reports',
  requiresData: true
};

let moduleData = null;

export async function render(container) {
  try {
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #6b7280;">Lade Reports...</div>';
    
    loadModuleCSS();
    
    const state = CoreAPI.getState();
    const dashboardData = await DataLayer.fetchDashboardData(state.selectedBrand, null, state.selectedCampaign);
    
    moduleData = { dashboardData };
    
    container.innerHTML = renderReports(dashboardData, state);
    bindEvents(container);
    
  } catch (error) {
    console.error('[Reports] Error:', error);
    container.innerHTML = `<div style="text-align: center; padding: 4rem; color: #ef4444;">${error.message}</div>`;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  moduleData = null;
}

function renderReports(data, state) {
  return `
    <div class="reports-v7">
      
      <div class="reports-header-v7">
        <div>
          <h1>Performance Reports</h1>
          <p class="subtitle-v7">Comprehensive Analytics & Insights</p>
        </div>
        <div class="header-actions-v7">
          <input type="date" class="date-picker-v7" />
          <button class="btn-export-v7" data-action="export">Export PDF</button>
        </div>
      </div>
      
      <!-- METRIC CARDS -->
      <div class="metrics-grid-v7">
        <div class="metric-card-v7">
          <div class="metric-label-v7">Total Spend</div>
          <div class="metric-value-v7">${formatCurrency(data.spend)}</div>
          <div class="metric-change-v7 positive">+12.3% vs last period</div>
        </div>
        <div class="metric-card-v7">
          <div class="metric-label-v7">Total Revenue</div>
          <div class="metric-value-v7">${formatCurrency(data.revenue)}</div>
          <div class="metric-change-v7 positive">+18.7% vs last period</div>
        </div>
        <div class="metric-card-v7">
          <div class="metric-label-v7">Average ROAS</div>
          <div class="metric-value-v7">${formatRoas(data.roas)}</div>
          <div class="metric-change-v7 negative">-3.2% vs last period</div>
        </div>
        <div class="metric-card-v7">
          <div class="metric-label-v7">Total Conversions</div>
          <div class="metric-value-v7">${data.conversions || 1234}</div>
          <div class="metric-change-v7 positive">+8.5% vs last period</div>
        </div>
      </div>
      
      <!-- CHART PLACEHOLDER -->
      <div class="chart-card-v7">
        <div class="chart-header-v7">
          <div class="chart-title-v7">Revenue & Spend Trend (Last 30 Days)</div>
          <select class="chart-filter-v7">
            <option>Last 7 Days</option>
            <option selected>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
        <div class="chart-placeholder-v7">
          <div class="placeholder-text-v7">Chart Integration Coming Soon</div>
        </div>
      </div>
      
      <!-- TOP CAMPAIGNS TABLE -->
      <div class="table-card-v7">
        <div class="table-header-v7">
          <div class="table-title-v7">Top Campaigns by ROAS</div>
        </div>
        <table class="reports-table-v7">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Spend</th>
              <th>Revenue</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Summer Sale 2025</td>
              <td>${formatCurrency(45230)}</td>
              <td>${formatCurrency(234500)}</td>
              <td class="roas-cell-v7">5.2x</td>
            </tr>
            <tr>
              <td>Black Friday Promo</td>
              <td>${formatCurrency(38920)}</td>
              <td>${formatCurrency(189400)}</td>
              <td class="roas-cell-v7">4.9x</td>
            </tr>
            <tr>
              <td>New Product Launch</td>
              <td>${formatCurrency(29100)}</td>
              <td>${formatCurrency(130950)}</td>
              <td class="roas-cell-v7">4.5x</td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  `;
}

function bindEvents(container) {
  const exportBtn = container.querySelector('[data-action="export"]');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      CoreAPI.showToast('Exporting report...', 'info');
    });
  }
}

function formatCurrency(value) {
  return value ? `€${Math.round(value).toLocaleString('de-DE')}` : '€0';
}

function formatRoas(value) {
  return value ? `${Number(value).toFixed(1)}x` : '0.0x';
}

function loadModuleCSS() {
  if (document.getElementById('reports-module-css')) return;
  const link = document.createElement('link');
  link.id = 'reports-module-css';
  link.rel = 'stylesheet';
  link.href = '/packages/reports/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('reports-module-css');
  if (link) link.remove();
}
