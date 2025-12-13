// packages/creativeLibrary/modal.js
// Titanium Edition – Fullscreen Creative Inspector (P2 FINAL FIX)

let modalEl = null;

export function openCreativeModal(creative) {
  closeCreativeModal();

  modalEl = document.createElement("div");
  modalEl.className = "so-modal-overlay";

  const box = document.createElement("div");
  box.className = "so-modal";

  const header = document.createElement("div");
  header.className = "so-modal-header";

  const title = document.createElement("div");
  title.className = "so-modal-title";
  title.textContent = creative?.name || "Creative Detail";

  const closeBtn = document.createElement("button");
  closeBtn.className = "so-modal-close";
  closeBtn.type = "button";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeCreativeModal);

  header.appendChild(title);
  header.appendChild(closeBtn);

  const preview = document.createElement("div");
  preview.className = "so-modal-preview";

  // Use actual <img> so we always render (background-image can fail silently)
  const img = document.createElement("img");
  img.alt = creative?.name || "Creative";
  img.loading = "lazy";
  img.src = creative?.thumbUrl || "";
  preview.appendChild(img);

  const kpiWrap = document.createElement("div");
  kpiWrap.className = "so-modal-kpis";

  const k = creative?.kpis || {};
  const impressions = toNumber(k.impressions);
  const clicks = toNumber(k.clicks);
  const spend = toNumber(k.spend);
  const roas = toNumber(k.roas);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : null;

  kpiWrap.appendChild(kpiRow("ROAS", formatRatio(roas)));
  kpiWrap.appendChild(kpiRow("Spend", formatCurrency(spend)));
  kpiWrap.appendChild(kpiRow("CTR", formatPercent(ctr)));
  kpiWrap.appendChild(kpiRow("CPM", formatCurrency(cpm)));
  kpiWrap.appendChild(kpiRow("Impressions", formatNumber(impressions)));
  kpiWrap.appendChild(kpiRow("Clicks", formatNumber(clicks)));

  const meta = document.createElement("div");
  meta.className = "so-modal-meta";

  meta.appendChild(metaRow("Brand", creative?.brand || "–"));
  meta.appendChild(metaRow("Format", creative?.format || "–"));
  meta.appendChild(metaRow("Type", creative?.type || "–"));
  meta.appendChild(metaRow("Status", creative?.status || "–"));
  if (creative?.campaignName) meta.appendChild(metaRow("Campaign", creative.campaignName));
  if (creative?.adsetName) meta.appendChild(metaRow("Adset", creative.adsetName));
  meta.appendChild(metaRow("ID", creative?.id || "–"));

  const actions = document.createElement("div");
  actions.className = "so-modal-actions";

  const btnClose = document.createElement("button");
  btnClose.className = "so-btn-secondary";
  btnClose.type = "button";
  btnClose.textContent = "Schließen";
  btnClose.addEventListener("click", closeCreativeModal);

  actions.appendChild(btnClose);

  box.appendChild(header);
  box.appendChild(preview);
  box.appendChild(kpiWrap);
  box.appendChild(meta);
  box.appendChild(actions);

  modalEl.appendChild(box);

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeCreativeModal();
  });

  document.body.appendChild(modalEl);
}

export function closeCreativeModal() {
  if (modalEl) {
    modalEl.remove();
    modalEl = null;
  }
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "–";
  return value.toLocaleString("de-DE");
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "–";
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function formatRatio(value) {
  if (!Number.isFinite(value)) return "–";
  return `${value.toFixed(2)}x`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "–";
  return `${value.toFixed(1)}%`;
}

function kpiRow(label, value) {
  const row = document.createElement("div");
  row.className = "so-kpi-row";

  const l = document.createElement("div");
  l.className = "so-kpi-row-label";
  l.textContent = label;

  const v = document.createElement("div");
  v.className = "so-kpi-row-value";
  v.textContent = value;

  row.appendChild(l);
  row.appendChild(v);
  return row;
}

function metaRow(label, value) {
  const row = document.createElement("div");
  row.className = "so-meta-row";

  const l = document.createElement("div");
  l.className = "so-meta-label";
  l.textContent = label;

  const v = document.createElement("div");
  v.className = "so-meta-value";
  v.textContent = value;

  row.appendChild(l);
  row.appendChild(v);
  return row;
}
