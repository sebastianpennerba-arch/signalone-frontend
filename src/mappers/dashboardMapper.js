// Hilfsfunktion, Meta-Insights --> DashboardSnapshot
export function mapMetaInsightsToDashboardSnapshot(insightsRows = [], brandId) {
  if (!Array.isArray(insightsRows) || insightsRows.length === 0) {
    return {
      brandId,
      spend30d: 0,
      revenue30d: 0,
      roas30d: 0,
      profitEst30d: 0,
      deltaSpend: 0,
      deltaRevenue: 0,
      deltaRoas: 0,
      deltaProfit: 0,
      signals: {
        system: "warning",
        list: [
          {
            type: "warning",
            message: "Keine Insights-Daten von Meta verfügbar."
          }
        ]
      }
    };
  }

  const row = insightsRows[0];

  const spend = parseFloat(row.spend || 0);
  const actions = row.actions || [];
  const actionValues = row.action_values || [];

  const purchaseAction =
    actions.find((a) => a.action_type === "purchase") || {};
  const purchaseValue =
    actionValues.find((a) => a.action_type === "purchase") || {};

  const purchases = parseFloat(purchaseAction.value || 0);
  const revenue = parseFloat(purchaseValue.value || 0);

  const roas = spend > 0 ? revenue / spend : 0;

  // Hier kannst du später echte Deltas aus historischer DB berechnen
  const deltaSpend = 0;
  const deltaRevenue = 0;
  const deltaRoas = 0;
  const deltaProfit = 0;

  const profitEst = revenue * 0.4; // Bsp. 40% Margin

  return {
    brandId,
    spend30d: spend,
    revenue30d: revenue,
    roas30d: roas,
    profitEst30d: profitEst,
    deltaSpend,
    deltaRevenue,
    deltaRoas,
    deltaProfit,
    signals: {
      system: "ok",
      list: [
        {
          type: "ok",
          message: "Live-Daten von Meta erfolgreich geladen."
        }
      ]
    }
  };
}
