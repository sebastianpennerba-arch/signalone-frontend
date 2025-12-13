/* ============================================================================
   Titanium Campaigns V1 – table.js
   Hybride Kampagnentabelle (optional)
   - Wird nur gerendert, wenn sie explizit aktiviert wird
   - Nutzt dieselben normalisierten Campaign Objects wie die Cards
   ============================================================================ */

import { formatMoney, formatPercent, formatNumber } from "../utils/format.js";

export function renderCampaignTable(root, campaigns = []) {
  if (!root) return;

  if (!campaigns.length) {
    root.innerHTML = emptyStateHTML();
    return;
  }

  root.innerHTML = `
    <table class="campaign-table">
      <thead>
        <tr>
          <th>Status</th>
          <th>Name</th>
          <th>Objective</th>
          <th>Spend</th>
          <th>ROAS</th>
          <th>CTR</th>
          <th>CPM</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        ${campaigns.map((c) => rowHTML(c)).join("")}
      </tbody>
    </table>
  `;

  wireActions(root, campaigns);
}

/* ============================================================================
   Row Rendering
   ============================================================================ */

function rowHTML(c) {
  const m = c.metrics || {};
  const status = (c.status || "ACTIVE").toUpperCase();
  const statusClass = `status-${status.toLowerCase()}`;

  return `
    <tr data-id="${escapeAttr(c.id)}">
      <td>
        <span class="campaign-status-pill ${statusClass}">
          ${status}
        </span>
      </td>

      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.objective || "SALES")}</td>

      <td>${formatMoney(m.spend)}</td>
      <td>${formatNumber(m.roas, 2, "x")}</td>
      <td>${formatPercent(m.ctr * 100, 2)}</td>
      <td>${formatMoney(m.cpm)}</td>

      <td>
        <button class="table-action-btn" data-action="details" data-id="${escapeAttr(c.id)}">
          Details
        </button>

        <button class="table-action-btn secondary" data-action="goto-creatives" data-id="${escapeAttr(c.id)}">
          Creatives
        </button>
      </td>
    </tr>
  `;
}

/* ============================================================================
   Empty State
   ============================================================================ */

function emptyStateHTML() {
  return `
    <div class="empty-state empty-state-glass">
      <div class="empty-state-icon">📉</div>
      <h3>Keine Kampagnen gefunden</h3>
      <p>Verbinde Meta Ads oder nutze den Demo Mode.</p>
    </div>
  `;
}

/* ============================================================================
   Action Binding
   ============================================================================ */

function wireActions(root, campaigns) {
  root.addEventListener("click", (evt) => {
    const btn = evt.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    const camp = campaigns.find((x) => x.id === id);
    if (!camp) return;

    if (action === "details") {
      openDetailsModal(camp);
    }

    if (action === "goto-creatives") {
      if (window.SignalOne?.navigateTo) {
        window.SignalOne.navigateTo("creativeLibrary");
      }
    }
  });
}

/* ============================================================================
   Modal
   ============================================================================ */

function openDetailsModal(c) {
  const m = c.metrics || {};
  window.SignalOne.openSystemModal(
    `Kampagne: ${escapeHtml(c.name)}`,
    `
      <div class="modal-kpi-grid">
        <div><label>Spend</label><span>${formatMoney(m.spend)}</span></div>
        <div><label>ROAS</label><span>${formatNumber(m.roas, 2, "x")}</span></div>
        <div><label>CTR</label><span>${formatPercent(m.ctr * 100, 2)}</span></div>
        <div><label>CPM</label><span>${formatMoney(m.cpm)}</span></div>
        <div><label>Purchases</label><span>${m.purchases}</span></div>
      </div>
    `
  );
}

/* ============================================================================
   Helpers
   ============================================================================ */

function escapeHtml(v) {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(v) {
  return escapeHtml(v).replace(/"/g, "&quot;");
}
