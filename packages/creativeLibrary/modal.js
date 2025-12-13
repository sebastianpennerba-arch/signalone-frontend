// packages/creativeLibrary/modal.js
// Titanium Edition – Fullscreen Creative Inspector (Smooth)

let modalEl = null;

export function openCreativeModal(creative) {
  closeCreativeModal(); // falls bereits offen

  modalEl = document.createElement("div");
  modalEl.className = "so-modal-overlay";

  const box = document.createElement("div");
  box.className = "so-modal";

  /* ---------- HEADER ---------- */

  const header = document.createElement("div");
  header.className = "so-modal-header";

  const title = document.createElement("div");
  title.className = "so-modal-title";
  title.textContent = creative.name || "Creative Detail";

  const closeBtn = document.createElement("button");
  closeBtn.className = "so-modal-close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeCreativeModal);

  header.appendChild(title);
  header.appendChild(closeBtn);

  /* ---------- PREVIEW ---------- */

  const preview = document.createElement("div");
  preview.className = "so-modal-preview";

  if (creative.thumbUrl) {
    preview.style.backgroundImage = `url(${creative.thumbUrl})`;
  }

  /* ---------- KPI SECTION ---------- */

  const kpiWrap = document.createElement("div");
  kpiWrap.className = "so-modal-kpis";

  const impressions = toNumber(creative.impressions);
  const clicks = toNumber(creative.clicks);
  const spend = toNumber(creative.spend);
  const roas = toNumber(creative.roas);

  const ctr =
    impressions > 0 && clicks >= 0 ? (clicks / impressions) * 100 : null;
  const cpm =
    impressions > 0 && spend >= 0 ? (spend / impressions) * 1000 : null;

  kpiWrap.appendChild(kpiRow("ROAS", formatRatio(roas)));
  kpiWrap.appendChild(kpiRow("Spend", formatCurrency(spend)));
  kpiWrap.appendChild(kpiRow("CTR", formatPercent(ctr)));
  kpiWrap.appendChild(kpiRow("CPM", formatCurrency(cpm)));
  kpiWrap.appendChild(kpiRow("Impressions", formatNumber(impressions)));
  kpiWrap.appendChild(kpiRow("Clicks", formatNumber(clicks)));

  /* ---------- META DATA ---------- */

  const meta = document.createElement("div");
  meta.className = "so-modal-meta";

  meta.appendChild(metaRow("Brand", creative.brand || "–"));
  meta.appendChild(metaRow("Format", creative.format || "–"));
  meta.appendChild(metaRow("Status", creative.status || "–"));
  meta.appendChild(metaRow("ID", creative.id || "–"));

  /* ---------- ACTIONS ---------- */

  const actions = document.createElement("div");
  actions.className = "so-modal-actions";

  const btnSensei = document.createElement("button");
  btnSensei.className = "so-btn-primary";
  btnSensei.textContent = "In Sensei öffnen";

  btnSensei.addEventListener("click", () => {
    if (window.SignalOne?.showToast) {
      window.SignalOne.showToast("info", "Sensei wird bald aktiviert.");
    } else {
      console.log("[CreativeLibrary] Sensei Stub", creative);
    }
  });

  const btnCompare = document.createElement("button");
  btnCompare.className = "so-btn-secondary";
  btnCompare.textContent = "Vergleich starten";

  btnCompare.addEventListener("click", () => {
    if (window.SignalOne?.showToast) {
      window.SignalOne.showToast("info", "Compare-Modus folgt bald.");
    } else {
      console.log("[CreativeLibrary] Compare Stub", creative);
    }
  });

  const btnClose = document.createElement("button");
  btnClose.className = "so-btn-ghost";
  btnClose.textContent = "Schließen";
  btnClose.addEventListener("click", closeCreativeModal);

  actions.appendChild(btnSensei);
  actions.appendChild(btnCompare);
  actions.appendChild(btnClose);

  /* ---------- COMPOSE ---------- */

  box.appendChild(header);
  box.appendChild(preview);
  box.appendChild(kpiWrap);
  box.appendChild(meta);
  box.appendChild(actions);

  modalEl.appendChild(box);

  // Klick auf Overlay schließt Modal
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) {
      closeCreativeModal();
    }
  });

  document.body.appendChild(modalEl);
}

export function closeCreativeModal() {
  if (modalEl) {
    modalEl.remove();
    modalEl = null;
  }
}

/* ---------- HELPERS ---------- */

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
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatRatio(value) {
  if (!Number.isFinite(value)) return "–";
  return `${value.toFixed(1)}x`;
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
