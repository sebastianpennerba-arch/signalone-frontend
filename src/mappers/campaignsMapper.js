export function mapMetaCampaignsToTitaniumCampaigns(
  metaCampaigns = [],
  insightsByCampaignId = {},
  brandId
) {
  return metaCampaigns.map((c) => {
    const insights = insightsByCampaignId[c.id] || [];
    const summary = aggregateCampaignInsights(insights);

    return {
      id: c.id,
      brandId,
      name: c.name,
      status:
        c.effective_status === "ACTIVE" || c.status === "ACTIVE"
          ? "active"
          : "paused",

      spend: summary.spend,
      revenue: summary.revenue,
      roas: summary.roas,
      impressions: summary.impressions,
      clicks: summary.clicks,
      cpc: summary.cpc,
      ctr: summary.ctr,
      cpm: summary.cpm,

      health: calcCampaignHealth(summary),

      lastUpdated: new Date().toISOString()
    };
  });
}

function aggregateCampaignInsights(rows = []) {
  let spend = 0;
  let impressions = 0;
  let clicks = 0;
  let revenue = 0;

  for (const row of rows) {
    spend += parseFloat(row.spend || 0);
    impressions += parseFloat(row.impressions || 0);
    clicks += parseFloat(row.clicks || 0);

    const actionValues = row.action_values || [];
    const purchaseValue =
      actionValues.find((a) => a.action_type === "purchase") || {};
    revenue += parseFloat(purchaseValue.value || 0);
  }

  const roas = spend > 0 ? revenue / spend : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;

  return {
    spend,
    revenue,
    roas,
    impressions,
    clicks,
    cpc,
    ctr,
    cpm
  };
}

function calcCampaignHealth(summary) {
  if (summary.roas >= 3) return "strong";
  if (summary.roas >= 1.5) return "warning";
  return "critical";
}
