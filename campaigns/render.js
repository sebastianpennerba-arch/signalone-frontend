/* =========================================================
   CAMPAIGNS - ELITE VISUAL RENDER
   Dashboard-aligned design with Cards & Table views
   ========================================================= */

function formatNumber(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '–';
  return n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '–';
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '–';
  return (n * 100).toFixed(2) + '%';
}

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('active') || s.includes('scaling')) return 'status-active';
  if (s.includes('pause')) return 'status-paused';
  if (s.includes('test')) return 'status-testing';
  return 'status-unknown';
}

function statusLabel(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('active')) return 'Active';
  if (s.includes('scaling')) return 'Scaling';
  if (s.includes('pause')) return 'Paused';
  if (s.includes('test')) return 'Testing';
  return status || 'Unknown';
}

function healthClass(score) {
  if (score >= 80) return 'health-excellent';
  if (score >= 60) return 'health-good';
  if (score >= 40) return 'health-warning';
  return 'health-critical';
}

export function renderCampaigns(root, viewModel) {
  const { campaigns, summary, viewMode, statusFilter, sortBy } = viewModel;
  const hasData = campaigns && campaigns.length > 0;

  let html = `
    <div class="campaigns-container">
      <div class="data-header">
        <div class="data-header-left">
          <h1>Campaigns</h1>
          <div class="data-header-meta">
            <span>${hasData ? campaigns.length : 0} Kampagnen</span>
            <span class="data-sep">•</span>
            <span>${summary?.spendTotal || '€0'} Total Spend</span>
          </div>
        </div>
        <div class="data-header-right">
          <button type="button" id="newCampaignBtn" class="data-btn-primary">
            <span>+ Neue Kampagne</span>
          </button>
        </div>
      </div>

      <div class="campaigns-summary">
        <div class="summary-card">
          <div class="summary-label">Total Spend</div>
          <div class="summary-value">${summary?.spendTotal || '€0'}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Ø ROAS</div>
          <div class="summary-value">${summary?.avgROAS || '0.0x'}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Ø CTR</div>
          <div class="summary-value">${summary?.avgCTR || '0%'}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Active</div>
          <div class="summary-value">${summary?.activeCount || 0}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Testing</div>
          <div class="summary-value">${summary?.testingCount || 0}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Paused</div>
          <div class="summary-value">${summary?.pausedCount || 0}</div>
        </div>
      </div>

      <div class="campaigns-controls">
        <div class="campaigns-controls-left">
          <div class="btn-group">
            <button type="button" class="btn-group-item ${statusFilter === 'all' ? 'active' : ''}" data-status-filter="all">Alle</button>
            <button type="button" class="btn-group-item ${statusFilter === 'active' ? 'active' : ''}" data-status-filter="active">Active</button>
            <button type="button" class="btn-group-item ${statusFilter === 'paused' ? 'active' : ''}" data-status-filter="paused">Paused</button>
            <button type="button" class="btn-group-item ${statusFilter === 'testing' ? 'active' : ''}" data-status-filter="testing">Testing</button>
          </div>
        </div>
        <div class="campaigns-controls-right">
          <select id="campaignSort" class="control-select">
            <option value="spend" ${sortBy === 'spend' ? 'selected' : ''}>Spend ↓</option>
            <option value="roas" ${sortBy === 'roas' ? 'selected' : ''}>ROAS ↓</option>
            <option value="ctr" ${sortBy === 'ctr' ? 'selected' : ''}>CTR ↓</option>
          </select>
          <div class="btn-group">
            <button type="button" class="btn-group-icon ${viewMode === 'cards' ? 'active' : ''}" data-view-mode="cards" title="Cards View">🎴</button>
            <button type="button" class="btn-group-icon ${viewMode === 'table' ? 'active' : ''}" data-view-mode="table" title="Table View">📊</button>
          </div>
        </div>
      </div>
  `;

  if (!hasData) {
    html += `
      <div class="data-welcome">
        <div class="data-welcome-card">
          <div class="data-logo">📈</div>
          <h2>Keine Kampagnen gefunden</h2>
          <p>Passe deine Filter an oder wähle einen anderen Brand/Campaign aus.</p>
        </div>
      </div>
    `;
    root.innerHTML = html;
    return;
  }

  if (viewMode === 'cards') {
    html += `
      <div class="campaigns-grid">
        ${campaigns.map(c => {
          const m = c.metrics || {};
          const h = c.health || { score: 0, label: 'Unknown' };
          return `
            <div class="data-card campaign-card">
              <div class="campaign-card-header">
                <div class="campaign-card-title">${c.name || 'Unnamed Campaign'}</div>
                <span class="badge ${statusClass(c.status)}">${statusLabel(c.status)}</span>
              </div>
              <div class="campaign-card-meta">
                <span>${c.objective || 'SALES'}</span>
              </div>
              <div class="campaign-card-health">
                <div class="health-bar">
                  <div class="health-bar-fill ${healthClass(h.score)}" style="width: ${h.score}%"></div>
                </div>
                <span class="health-label">${h.label} (${h.score}%)</span>
              </div>
              <div class="campaign-card-metrics">
                <div class="metric">
                  <div class="metric-label">Spend</div>
                  <div class="metric-value">${formatCurrency(m.spend || 0)}</div>
                </div>
                <div class="metric">
                  <div class="metric-label">ROAS</div>
                  <div class="metric-value">${formatNumber(m.roas || 0, 1)}×</div>
                </div>
                <div class="metric">
                  <div class="metric-label">CTR</div>
                  <div class="metric-value">${formatPercent(m.ctr || 0)}</div>
                </div>
                <div class="metric">
                  <div class="metric-label">CPM</div>
                  <div class="metric-value">${formatCurrency(m.cpm || 0)}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    // Table View
    html += `
      <div class="campaigns-table-container">
        <table class="campaigns-table">
          <thead>
            <tr>
              <th>Kampagne</th>
              <th>Status</th>
              <th>Health</th>
              <th class="text-right">Spend</th>
              <th class="text-right">ROAS</th>
              <th class="text-right">CTR</th>
              <th class="text-right">CPM</th>
            </tr>
          </thead>
          <tbody>
            ${campaigns.map(c => {
              const m = c.metrics || {};
              const h = c.health || { score: 0, label: 'Unknown' };
              return `
                <tr>
                  <td>
                    <div class="table-campaign-name">${c.name || 'Unnamed'}</div>
                    <div class="table-campaign-objective">${c.objective || 'SALES'}</div>
                  </td>
                  <td><span class="badge badge-sm ${statusClass(c.status)}">${statusLabel(c.status)}</span></td>
                  <td>
                    <div class="health-bar health-bar-sm">
                      <div class="health-bar-fill ${healthClass(h.score)}" style="width: ${h.score}%"></div>
                    </div>
                  </td>
                  <td class="text-right">${formatCurrency(m.spend || 0)}</td>
                  <td class="text-right">${formatNumber(m.roas || 0, 1)}×</td>
                  <td class="text-right">${formatPercent(m.ctr || 0)}</td>
                  <td class="text-right">${formatCurrency(m.cpm || 0)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  html += `
    </div>
  `;

  root.innerHTML = html;
}

export function renderEmptyState(root) {
  root.innerHTML = `
    <div class="data-welcome">
      <div class="data-welcome-card">
        <div class="data-logo">📈</div>
        <h2>Keine Kampagnen verfügbar</h2>
        <p>Erstelle deine erste Kampagne oder wechsle in den Demo-Modus.</p>
      </div>
    </div>
  `;
}

export function renderErrorState(root) {
  root.innerHTML = `
    <div class="data-welcome">
      <div class="data-welcome-card">
        <div class="data-logo">!</div>
        <h2>Loading Error</h2>
        <p>Campaigns could not be loaded. Please try again.</p>
      </div>
    </div>
  `;
}
