// packages/dashboard/blocks.js
// Kleine UI-Helper für Dashboard Sections – reines HTML/Formatting.

export function esc(input) {
  const s = String(input ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function fmtInt(n) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return "0";
  return Math.round(v).toLocaleString("de-DE");
}

export function fmtNumber(n, digits = 2) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return "0";
  return v.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtCurrency(n, digits = 0) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return "0 €";
  return v.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPercent(n, digits = 2) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return "0%";
  return (v * 100).toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }) + "%";
}

export function pill(label, tone = "neutral") {
  const t =
    tone === "success"
      ? "so-pill-success"
      : tone === "critical"
      ? "so-pill-critical"
      : tone === "warning"
      ? "so-pill-warning"
      : "so-pill-neutral";

  return `<span class="so-pill ${t}">${esc(label)}</span>`;
}

export function badge(label, tone = "neutral") {
  const t =
    tone === "success"
      ? "badge-success"
      : tone === "critical"
      ? "badge-danger"
      : tone === "warning"
      ? "badge-warning"
      : "badge-soon";

  return `<span class="badge ${t}">${esc(label)}</span>`;
}

export function kpiValue(kpi) {
  const kind = kpi.kind || "number";
  const digits =
    typeof kpi.decimals === "number" ? kpi.decimals : kind === "currency" ? 0 : 2;
  const v = Number(kpi.value || 0);

  if (kind === "currency") return fmtCurrency(v, digits);
  if (kind === "percent") return fmtPercent(v, digits);
  if (kind === "int") return fmtInt(v);
  return fmtNumber(v, digits);
}

export function emptyBox(title, text) {
  return `
    <div class="empty-state">
      <div class="empty-state-title">${esc(title || "Empty")}</div>
      <p class="empty-state-text">${esc(text || "")}</p>
    </div>
  `;
}
