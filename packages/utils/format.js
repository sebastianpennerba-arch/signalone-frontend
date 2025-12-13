/* ================================================
   Utils – Format Helpers (Full Titanium Suite)
   ================================================ */

export function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "€0";
  return "€" + n.toLocaleString("de-DE");
}

export function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0%";
  return (n * 100).toFixed(1) + "%";
}

export function formatCTR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00%";
  return (n * 100).toFixed(2) + "%";
}

export function formatROAS(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.0x";
  return n.toFixed(1) + "x";
}

/* NEW – required by Campaigns */
export function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("de-DE");
}

export default {
  formatMoney,
  formatPercent,
  formatCTR,
  formatROAS,
  formatNumber
};
