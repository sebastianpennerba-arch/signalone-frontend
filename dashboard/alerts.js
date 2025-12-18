// packages/dashboard/alerts.js
// Optionaler Helper (nicht zwingend genutzt, aber sauber & verfügbar)
// Falls du Alerts später modularer machen willst.

export function normalizeSeverity(sev) {
  const s = String(sev || "").toLowerCase();
  if (s === "success") return "success";
  if (s === "critical" || s === "danger" || s === "error") return "critical";
  return "warning";
}

export function makeAlert({ severity, title, text, badge }) {
  return {
    severity: normalizeSeverity(severity),
    title: String(title || "Alert"),
    text: String(text || ""),
    badge: badge ? String(badge) : "",
  };
}
