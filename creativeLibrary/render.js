/**
 * SignalOne - Creative Library Render V6.1 PHASE 2
 * Load More Button + Pagination UI
 */

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

function getFormatIcon(format) {
  const f = (format || "").toLowerCase();
  if (f.includes("video") || f.includes("reel")) return "🎥";
  if (f.includes("story")) return "📱";
  if (f.includes("carousel")) return "🎡";
  if (f.includes("static") || f.includes("image")) return "🖼️";
  return "🎨";
}

function getROASColor(roas) {
  const r = Number(roas);
  if (r >= 4.0) return "#10B981";
  if (r >= 2.5) return "#F59E0B";
  return "#EF4444";
}

function getGradientForId(id) {
  const gradients = [
    "linear-gradient(135deg, #4F80FF 0%, #8B5CF6 100%)",
    "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
    "linear-gradient(135deg, #F093FB 0%, #F5576C 100%)",
    "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
    "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)",
    "linear-gradient(135deg, #FA709A 0%, #FEE140 100%)",
    "linear-gradient(135deg, #30CFD0 0%, #330867 100%)",
    "linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)",
    "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)",
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  
  return gradients[Math.abs(hash) % gradients.length];
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
            <span>📤 Upload</span>
          </button>
        </div>
      </div>

      <div class="cl-controls">
        <div class="cl-control-item cl-control-grow">
          <input
            type="search"
            id="clSearch"
            class="cl-input"
            placeholder="🔍 Search name, brand, campaign, tags..."
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
          <div class="cl-empty-icon">🎨</div>
          <div class="cl-empty-title">Keine Creatives gefunden</div>
          <div class="cl-empty-text">Passe Filter oder Suchbegriff an oder lade dein erstes Creative hoch.</div>
          <button type="button" class="cl-empty-btn" onclick="document.getElementById('clNewCreativeBtn')?.click()">
            📤 Creative hochladen
          </button>
        </div>
      `}
    </div>
  `;
}

// 🔥 PHASE 2: Render Grid with Load More
export function renderGridOnly(root, creatives, hasMore, totalCount) {
  const grid = root.querySelector("[data-cl-grid]");
  if (!grid) return;
  
  const gridHTML = (creatives || []).map(c => renderCard(c)).join("");
  
  // 🔥 PHASE 2: Add Load More Button if needed
  const loadMoreHTML = hasMore ? `
    <div class="cl-load-more-container">
      <button type="button" id="clLoadMoreBtn" class="cl-load-more-btn">
        <span class="cl-load-more-icon">📥</span>
        <span class="cl-load-more-text">Mehr laden</span>
        <span class="cl-load-more-count">(${creatives.length} von ${totalCount})</span>
      </button>
    </div>
  ` : (creatives.length > 0 ? `
    <div class="cl-load-more-container">
      <div class="cl-load-more-end">
        <span>✅ Alle ${totalCount} Creatives geladen</span>
      </div>
    </div>
  ` : '');
  
  grid.innerHTML = gridHTML + loadMoreHTML;
}

function renderCard(c) {
  const k = c.kpis || {};
  const roas = Number(k.roas || 0);
  const ctr = Number(k.ctr || 0) * 100;
  const cpm = Number(k.cpm || 0);
  const spend = Number(k.spend || 0);
  
  const roasColor = getROASColor(roas);
  const formatIcon = getFormatIcon(c.format);
  const gradient = getGradientForId(c.id);

  return `
    <div class="cl-card" data-cl-card="${esc(c.id)}" role="button" tabindex="0">
      <div class="cl-thumb" style="background: ${gradient};">
        <img src="/assets/logo.png" alt="SignalOne Logo" class="cl-thumb-logo-img" />
        <div class="cl-thumb-demo-badge">Demo Bild</div>
        <div class="cl-thumb-overlay"></div>
        <div class="cl-thumb-top">
          <button class="cl-select" type="button" data-cl-select="${esc(c.id)}" aria-label="Select creative"></button>
          <span class="cl-status ${statusClass(c.status)}">${esc(statusLabel(c.status))}</span>
        </div>
        <div class="cl-thumb-bottom">
          <span class="cl-format">${formatIcon} ${esc(c.format || "Creative")}</span>
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
          <div class="cl-chip cl-chip-roas" style="border-color: ${roasColor};">
            <div class="cl-chip-icon">📊</div>
            <div class="cl-chip-label">Sensei Score</div>
            <div class="cl-chip-value" style="color: ${roasColor};">${formatNumber(roas, 2)}×</div>
          </div>
          <div class="cl-chip cl-chip-spend">
            <div class="cl-chip-icon">💰</div>
            <div class="cl-chip-label">Spend</div>
            <div class="cl-chip-value">${formatCurrency(spend)}</div>
          </div>
          <div class="cl-chip cl-chip-ctr">
            <div class="cl-chip-icon">🎯</div>
            <div class="cl-chip-label">CTR</div>
            <div class="cl-chip-value">${formatNumber(ctr, 1)}%</div>
          </div>
          <div class="cl-chip cl-chip-cpm">
            <div class="cl-chip-icon">💸</div>
            <div class="cl-chip-label">CPM</div>
            <div class="cl-chip-value">${formatCurrency(cpm)}</div>
          </div>
        </div>

        <div class="cl-actions">
          <button type="button" class="cl-btn cl-btn-ghost" data-cl-sensei="${esc(c.id)}">
            🧠 Sensei
          </button>
          <button type="button" class="cl-btn cl-btn-primary" data-cl-details="${esc(c.id)}">
            → Details
          </button>
        </div>
      </div>
    </div>
  `;
}
