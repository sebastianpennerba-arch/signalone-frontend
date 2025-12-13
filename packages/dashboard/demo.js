// packages/dashboard/demo.js
// Dashboard v5 – kleine Demo-Utilities (optional)
// Kein Muss, aber hilfreich fürs Debugging im Browser.

export function attachDashboardDebug(model) {
  if (typeof window === "undefined") return;
  window.SignalOne = window.SignalOne || {};
  window.SignalOne.DashboardDebug = {
    model,
    ts: Date.now(),
  };
}
