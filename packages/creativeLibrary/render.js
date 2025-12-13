/* =========================================================
   CREATIVE LIBRARY - ELITE VISUAL RENDER
   Dashboard-aligned card design
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

function statusLabel(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('scale') || s.includes('winner')) return 'Scaling';
  if (s.includes('test')) return 'Testing';
  if (s.includes('pause')) return 'Paused';
  return 'Active';
}

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('scale') || s.includes('winner')) return 'cl-status-success';
  if (s.includes('test')) return 'cl-status-warning';
  if (s.includes('pause')) return 'cl-status-neutral';
  return 'cl-status-neutral';
}

export function renderCreativeLibrary(root, viewModel) {
  const { creatives, summary, formats, activeFilters } = viewModel;
  const hasData = creatives && creatives.length > 0;

  const search = activeFilters?.search || '';
  const formatFilter = activeFilters?.format || '';
  const sort = activeFilters?.sort || 'roasDesc';

  let html = `
    <div class="cl-container">
      <div class="data-header">
        <div class="data-header-left">
          <h1>Creative Library</h1>
          <div class="data-header-meta">
            <span>${hasData ? creatives.length : 0} Creatives</span>
            <span class="data-sep">•</span>
            <span>${summary?.totalSpend ? formatCurrency(summary.totalSpend) : '€0'} Total Spend</span>
          </div>
        </div>
        <div class="data-header-right">
          <button type="button" id="clNewCreativeBtn" class="data-btn-primary">
            <span>+ Upload Creative</span>
          </button>
        </div>
      </div>

      <div class="cl-controls">
        <div class="cl-control-item" style="flex: 2;">
          <input
            type="search"
            id="clSearch"
            class="cl-input"
            placeholder="Search by name, brand or format…"
            value="${search.replace(/"/g, '&quot;')}"
          />
        </div>
        <div class="cl-control-item">
          <select id="clFormat" class="cl-select">
            <option value="">All Formats</option>
            ${Array.isArray(formats) ? formats.map(f => `
              <option value="${String(f)}" ${f === formatFilter ? 'selected' : ''}>${f}</option>
            `).join('') : ''}
          </select>
        </div>
        <div class="cl-control-item">
          <select id="clSort" class="cl-select">
            <option value="roasDesc" ${sort === 'roasDesc' ? 'selected' : ''}>ROAS ↓</option>
            <option value="spendDesc" ${sort === 'spendDesc' ? 'selected' : ''}>Spend ↓</option>
            <option value="impressionsDesc" ${sort === 'impressionsDesc' ? 'selected' : ''}>Impressions ↓</option>
          </select>
        </div>
      </div>
  `;

  if (!hasData) {
    html += `
      <div class="data-welcome">
        <div class="data-welcome-card">
          <div class="data-logo">CL</div>
          <h2>No Creatives Found</h2>
          <p>Adjust your filters or select a different brand/campaign from the top bar.</p>
        </div>
      </div>
    `;
    root.innerHTML = html;
    return;
  }

  html += `
      <div class="cl-grid">
        ${creatives.map(c => {
          const k = c.kpis || {};
          const thumb = c.thumbnail || c.thumbUrl || '';
          const badgeClass = statusClass(c.status);
          const badgeLabel = statusLabel(c.status);
          const roasVal = k.roas ?? c.roas ?? 0;
          const roasStatus = roasVal >= 4 ? 'success' : roasVal >= 3 ? 'warning' : roasVal >= 2 ? 'neutral' : 'critical';

          return `
            <div class="data-card cl-card" data-creative-id="${c.id}">
              <div class="cl-thumb" style="${
                thumb
                  ? `background-image:url('${thumb}');`
                  : 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
              }">
                <div class="cl-overlay">
                  <span class="cl-format-badge">${c.format || 'Creative'}</span>
                </div>
              </div>
              <div class="cl-body">
                <div class="cl-header-row">
                  <div class="cl-title">${c.name || 'Unnamed Creative'}</div>
                  <span class="badge badge-soft ${badgeClass}">${badgeLabel}</span>
                </div>
                <div class="cl-meta-row">
                  <span class="cl-brand">${c.brand || '–'}</span>
                  <span class="cl-type">${c.type || 'Image'}</span>
                </div>
                <div class="cl-kpis">
                  <div class="cl-kpi cl-kpi-${roasStatus}">
                    <div class="cl-kpi-label">ROAS</div>
                    <div class="cl-kpi-value">${formatNumber(roasVal, 2)}×</div>
                  </div>
                  <div class="cl-kpi">
                    <div class="cl-kpi-label">Spend</div>
                    <div class="cl-kpi-value">${formatCurrency(k.spend ?? c.spend ?? 0)}</div>
                  </div>
                  <div class="cl-kpi">
                    <div class="cl-kpi-label">Impr.</div>
                    <div class="cl-kpi-value">${formatNumber(k.impressions ?? c.impressions ?? 0, 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  root.innerHTML = html;
}

export function renderEmptyState(root) {
  root.innerHTML = `
    <div class="data-welcome">
      <div class="data-welcome-card">
        <div class="data-logo">CL</div>
        <h2>No Creatives Available</h2>
        <p>Upload your first creative or switch to demo mode.</p>
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
        <p>Creative Library could not be loaded. Please try again.</p>
      </div>
    </div>
  `;
}
