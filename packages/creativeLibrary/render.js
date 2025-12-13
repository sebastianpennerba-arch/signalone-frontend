// packages/creativeLibrary/render.js
// Titanium Creative Library Renderer (P2 FINAL FIX)

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function formatNumber(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function statusLabel(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("winner") || s.includes("scale")) return "Winner";
  if (s.includes("test")) return "Testing";
  if (s.includes("pause")) return "Paused";
  if (s.includes("dead")) return "Dead";
  if (s.includes("attention") || s.includes("retest")) return "Attention";
  return "Active";
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("winner") || s.includes("scale")) return "cl-status-success";
  if (s.includes("test")) return "cl-status-warning";
  if (s.includes("pause")) return "cl-status-neutral";
  if (s.includes("dead")) return "cl-status-danger";
  if (s.includes("attention") || s.includes("retest")) return "cl-status-warning";
  return "cl-status-neutral";
}

export function renderCreativeLibrary(root, viewModel) {
  const { creatives = [], summary = {}, formats = [], activeFilters = {} } = viewModel || {};
  const hasData = creatives.length > 0;

  const search = activeFilters.search || "";
  const formatFilter = activeFilters.format || "";
  const sort = activeFilters.sort || "roasDesc";

  root.innerHTML = `
    <div class="cl-container">
      <div class="data-header">
        <div class="data-header-left">
          <h1>Creative Library</h1>
          <div class="data-header-meta">
            <span>${hasData ? creatives.length : 0} Creatives</span>
            <span class="data-sep">•</span>
            <span>${summary.totalSpend ? formatCurrency(summary.totalSpend) : "€0"} Spend</span>
          </div>
        </div>
        <div class="data-header-right">
          <button type="button" id="clNewCreativeBtn" class="data-btn-primary">
            <span>+ Upload</span>
          </button>
        </div>
      </div>

      <div class="cl-controls">
        <div class="cl-control-item cl-control-grow">
          <input
            type="search"
            id="clSearch"
            class="cl-input"
            placeholder="Search name, brand, campaign, tags..."
            value="${esc(search)}"
            autocomplete="off"
          />
        </div>

        <div class="cl-control-item">
          <select id="clFormat" class="cl-select">
            <option value="">All Formats</option>
            ${Array.isArray(formats) ? formats.map(f => `
              <option value="${esc(f)}" ${String(f) === String(formatFilter) ? "selected" : ""}>${esc(f)}</option>
            `).join("") : ""}
          </select>
        </div>

        <div class="cl-control-item">
          <select id="clSort" class="cl-select">
            <option value="roasDesc" ${sort === "roasDesc" ? "selected" : ""}>ROAS ↓</option>
            <option value="spendDesc" ${sort === "spendDesc" ? "selected" : ""}>Spend ↓</option>
            <option value="ctrDesc" ${sort === "ctrDesc" ? "selected" : ""}>CTR ↓</option>
          </select>
        </div>
      </div>

      ${hasData ? `
        <div class="cl-grid" data-cl-grid>
          ${creatives.map(c => renderCard(c)).join("")}
        </div>
      ` : `
        <div class="cl-empty">
          <div class="cl-empty-title">Keine Creatives gefunden</div>
          <div class="cl-empty-text">Passe Filter oder Suchbegriff an.</div>
        </div>
      `}
    </div>
  `;
}

export function renderGridOnly(root, creatives) {
  const grid = root.querySelector("[data-cl-grid]");
  if (!grid) return;
  grid.innerHTML = (creatives || []).map(c => renderCard(c)).join("");
}

function renderCard(c) {
  const k = c.kpis || {};
  const roas = Number(k.roas || 0);
  const ctr = Number(k.ctr || 0) * 100;
  const cpm = Number(k.cpm || 0);

  // IMPORTANT: give every interactive element a deterministic hook
  return `
    <div class="cl-card" data-cl-card="${esc(c.id)}" role="button" tabindex="0">
      <div class="cl-thumb" style="background-image:url('${esc(c.thumbUrl)}')">
        <div class="cl-thumb-top">
          <button class="cl-select" type="button" data-cl-select="${esc(c.id)}" aria-label="Select creative"></button>
          <span class="cl-status ${statusClass(c.status)}">${esc(statusLabel(c.status))}</span>
        </div>
        <div class="cl-thumb-bottom">
          <span class="cl-format">${esc(c.format || "Creative")}</span>
        </div>
      </div>

      <div class="cl-body">
        <div class="cl-title">${esc(c.name || "Unnamed Creative")}</div>

        <div class="cl-meta">
          <span class="cl-meta-strong">${esc(c.brand || "–")}</span>
          <span class="data-sep">•</span>
          <span class="cl-meta-dim">${esc(c.type || "–")}</span>
          ${c.campaignName ? `<span class="data-sep">•</span><span class="cl-meta-dim">${esc(c.campaignName)}</span>` : ""}
        </div>

        <div class="cl-kpis">
          <div class="cl-chip">
            <div class="cl-chip-label">ROAS</div>
            <div class="cl-chip-value">${formatNumber(roas, 2)}×</div>
          </div>
          <div class="cl-chip">
            <div class="cl-chip-label">Spend</div>
            <div class="cl-chip-value">${formatCurrency(k.spend || 0)}</div>
          </div>
          <div class="cl-chip">
            <div class="cl-chip-label">CTR</div>
            <div class="cl-chip-value">${formatNumber(ctr, 1)}%</div>
          </div>
          <div class="cl-chip">
            <div class="cl-chip-label">CPM</div>
            <div class="cl-chip-value">${formatCurrency(cpm)}</div>
          </div>
        </div>

        <div class="cl-actions">
          <button type="button" class="cl-btn cl-btn-ghost" data-cl-sensei="${esc(c.id)}">Sensei</button>
          <button type="button" class="cl-btn cl-btn-soft" data-cl-details="${esc(c.id)}">Details</button>
        </div>
      </div>
    </div>
  `;
}
