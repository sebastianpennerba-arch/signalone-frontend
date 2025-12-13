// packages/creativeLibrary/render.js
// Titanium UI Renderer (single render path, no inline styles)

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

function formatNumber(value, digits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "winner") return "Winner";
  if (s === "solid") return "Solid";
  if (s === "attention") return "Attention";
  if (s === "dead") return "Dead";
  if (s === "paused") return "Paused";
  return "Testing";
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "winner") return "so-pill so-pill-good";
  if (s === "solid") return "so-pill so-pill-neutral";
  if (s === "attention") return "so-pill so-pill-warn";
  if (s === "dead") return "so-pill so-pill-bad";
  if (s === "paused") return "so-pill so-pill-neutral";
  return "so-pill so-pill-warn";
}

function roasTone(roas) {
  const x = Number(roas || 0);
  if (x >= 4) return "good";
  if (x >= 3) return "warn";
  if (x >= 2) return "neutral";
  return "bad";
}

export function renderCreativeLibrary(root, viewModel) {
  const {
    creatives = [],
    summary = {},
    formats = [],
    filters = {},
    selectionCount = 0,
    modeLabel = "Demo Mode",
  } = viewModel || {};

  const hasData = creatives.length > 0;

  root.innerHTML = `
    <div class="so-cl">
      <div class="so-cl-header">
        <div class="so-cl-header-left">
          <h1 class="so-cl-title">Creative Library</h1>
          <div class="so-cl-sub">
            <span>${esc(modeLabel)}</span>
            <span class="so-dot">•</span>
            <span>${formatNumber(summary.totalCreatives || creatives.length)} Creatives</span>
            <span class="so-dot">•</span>
            <span>${formatCurrency(summary.totalSpend || 0)} Spend</span>
          </div>
        </div>

        <div class="so-cl-header-right">
          <button type="button" id="soClUploadBtn" class="so-btn so-btn-primary">
            + Upload
          </button>
        </div>
      </div>

      <div class="so-cl-controls">
        <div class="so-cl-control so-cl-control-grow">
          <input
            id="soClSearch"
            type="search"
            class="so-input"
            placeholder="Search name, brand, campaign, tags…"
            value="${esc(filters.search || "")}"
            autocomplete="off"
          />
        </div>

        <div class="so-cl-control">
          <select id="soClFormat" class="so-select">
            <option value="">All Formats</option>
            ${Array.isArray(formats) ? formats.map((f) => `
              <option value="${esc(f)}" ${String(filters.format || "") === String(f) ? "selected" : ""}>${esc(f)}</option>
            `).join("") : ""}
          </select>
        </div>

        <div class="so-cl-control">
          <select id="soClBucket" class="so-select">
            ${["all","winner","solid","testing","attention","paused","dead"].map((b) => `
              <option value="${b}" ${String(filters.bucket || "all") === b ? "selected" : ""}>${b[0].toUpperCase() + b.slice(1)}</option>
            `).join("")}
          </select>
        </div>

        <div class="so-cl-control">
          <select id="soClType" class="so-select">
            <option value="all" ${String(filters.type || "all") === "all" ? "selected" : ""}>All Types</option>
            <option value="image" ${String(filters.type || "all") === "image" ? "selected" : ""}>Image</option>
            <option value="video" ${String(filters.type || "all") === "video" ? "selected" : ""}>Video</option>
          </select>
        </div>

        <div class="so-cl-control">
          <select id="soClSort" class="so-select">
            ${[
              ["roas-desc","ROAS ↓"],
              ["spend-desc","Spend ↓"],
              ["ctr-desc","CTR ↓"],
              ["cpm-asc","CPM ↑"],
            ].map(([v,l]) => `
              <option value="${v}" ${String(filters.sort || "roas-desc") === v ? "selected" : ""}>${l}</option>
            `).join("")}
          </select>
        </div>
      </div>

      ${renderSelectionBar(selectionCount)}

      ${hasData ? `
        <div class="so-cl-grid" data-so-cl-grid>
          ${creatives.map((c) => renderCard(c, viewModel)).join("")}
        </div>
      ` : `
        <div class="so-cl-empty">
          <div class="so-cl-empty-title">Keine Creatives gefunden</div>
          <div class="so-cl-empty-text">Passe Filter oder Suchbegriff an.</div>
        </div>
      `}
    </div>
  `;
}

export function renderGridOnly(root, creatives, opts = {}) {
  const { selection, selectionCount, selectionOnly } = opts;

  // Update selection bar
  const bar = root.querySelector("[data-so-cl-selectionbar]");
  if (bar) bar.outerHTML = renderSelectionBar(selectionCount || 0);

  // Update grid
  const grid = root.querySelector("[data-so-cl-grid]");
  if (!grid) return;

  if (selectionOnly) {
    // only toggle selected classes + checkbox state (fast path)
    grid.querySelectorAll("[data-so-cl-card]").forEach((el) => {
      const id = el.getAttribute("data-so-cl-card");
      const selected = selection?.has?.(String(id));
      el.classList.toggle("is-selected", !!selected);

      const cb = el.querySelector("[data-so-cl-select]");
      if (cb) {
        const inp = cb.querySelector("input[type='checkbox']");
        if (inp) inp.checked = !!selected;
      }
    });
    return;
  }

  grid.innerHTML = (creatives || []).map((c) => renderCard(c, { selection })).join("");
}

export function renderEmptyState(root, modeLabel = "Demo Mode") {
  root.innerHTML = `
    <div class="so-cl so-cl-empty-wrap">
      <div class="so-cl-empty">
        <div class="so-cl-empty-title">No Creatives Available</div>
        <div class="so-cl-empty-text">${esc(modeLabel)} – bitte Brand/Campaign wechseln oder Demo aktivieren.</div>
      </div>
    </div>
  `;
}

export function renderErrorState(root, message = "Loading Error") {
  root.innerHTML = `
    <div class="so-cl so-cl-empty-wrap">
      <div class="so-cl-empty">
        <div class="so-cl-empty-title">⚠️ Loading Error</div>
        <div class="so-cl-empty-text">${esc(message)}</div>
      </div>
    </div>
  `;
}

/* ----------------------------- Parts ----------------------------- */

function renderSelectionBar(count) {
  const visible = count > 0 ? "is-visible" : "";
  return `
    <div class="so-cl-selection ${visible}" data-so-cl-selectionbar>
      <div class="so-cl-selection-left">
        <span class="so-cl-selection-count">${count}</span>
        <span>selected</span>
      </div>
      <div class="so-cl-selection-actions">
        <button class="so-btn so-btn-secondary" data-so-cl-bulk="compare">Compare</button>
        <button class="so-btn so-btn-ghost" data-so-cl-bulk="sensei">Sensei</button>
        <button class="so-btn so-btn-ghost" data-so-cl-bulk="clear">Clear</button>
      </div>
    </div>
  `;
}

function renderCard(c, vm) {
  const id = esc(c.id);
  const k = c.kpis || {};
  const selected = vm?.selection?.has?.(String(c.id));

  const roas = Number(k.roas || 0);
  const ctr = Number(k.ctr || 0) * 100;
  const cpm = Number(k.cpm || 0);

  const hasThumb = !!(c.thumbUrl && String(c.thumbUrl).trim());
  const tone = roasTone(roas);

  return `
    <div class="so-cl-card ${selected ? "is-selected" : ""}" data-so-cl-card="${id}">
      <div class="so-cl-thumb">
        ${hasThumb ? `<img src="${esc(c.thumbUrl)}" alt="${esc(c.name)}" loading="lazy" />` : `<div class="so-cl-thumb-fallback"></div>`}
        <div class="so-cl-thumb-top">
          <label class="so-cl-select" data-so-cl-select="${id}" title="Select">
            <input type="checkbox" ${selected ? "checked" : ""} />
            <span></span>
          </label>
          <span class="${statusClass(c.status)}">${esc(statusLabel(c.status))}</span>
        </div>
        <div class="so-cl-thumb-bot">
          <span class="so-cl-format">${esc(c.format || "Creative")}</span>
        </div>
      </div>

      <div class="so-cl-body">
        <div class="so-cl-card-title">${esc(c.name || "Unnamed Creative")}</div>
        <div class="so-cl-card-meta">
          <span class="so-cl-brand">${esc(c.brand || "–")}</span>
          <span class="so-dot">•</span>
          <span class="so-cl-type">${esc(c.type || "image")}</span>
        </div>

        <div class="so-cl-kpis">
          <div class="so-kpi so-kpi-${tone}">
            <div class="so-kpi-label">ROAS</div>
            <div class="so-kpi-value">${formatNumber(roas, 2)}×</div>
          </div>
          <div class="so-kpi">
            <div class="so-kpi-label">Spend</div>
            <div class="so-kpi-value">${formatCurrency(k.spend || 0)}</div>
          </div>
          <div class="so-kpi">
            <div class="so-kpi-label">CTR</div>
            <div class="so-kpi-value">${formatNumber(ctr, 1)}%</div>
          </div>
          <div class="so-kpi">
            <div class="so-kpi-label">CPM</div>
            <div class="so-kpi-value">${formatCurrency(cpm)}</div>
          </div>
        </div>

        <div class="so-cl-card-actions">
          <button class="so-btn so-btn-ghost" data-so-cl-sensei="${id}">Sensei</button>
          <button class="so-btn so-btn-secondary">Details</button>
        </div>
      </div>
    </div>
  `;
}
