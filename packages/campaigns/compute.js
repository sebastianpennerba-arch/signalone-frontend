/* ----------------------------------------------------------
   CAMPAIGNS – compute.js (Titanium Compatible)
-----------------------------------------------------------*/

export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n =
    typeof value === "string"
      ? parseFloat(value.replace(/,/g, ""))
      : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/* ----------------------------------------------------------
  DEMO METRICS
-----------------------------------------------------------*/
function seededRandom(seed) {
  let h = 0;
  const str = String(seed || "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return (h >>> 0) / 0xffffffff;
}

export function buildDemoMetrics(camp, brandId, index) {
  const seed = `${brandId}:${camp.id || index}`;
  const r1 = seededRandom(seed + ":A");
  const r2 = seededRandom(seed + ":B");
  const r3 = seededRandom(seed + ":C");

  const spend = Math.round(4000 + r1 * 24000);
  const roas = Number((2 + r2 * 4).toFixed(1));
  const ctr = Number((0.012 + r3 * 0.028).toFixed(3));
  const cpm = Number((6 + (1 - r2) * 6).toFixed(1));
  const purchases = Math.round(spend / (25 + r3 * 40));

  return { spend, roas, ctr, cpm, purchases };
}

/* ----------------------------------------------------------
  LIVE METRICS
-----------------------------------------------------------*/
export function normalizeLiveMetrics(srcRaw) {
  const src = srcRaw?.metrics || srcRaw || {};

  const impressions = toNumber(src.impressions);
  const clicks = toNumber(src.clicks);
  const spend = toNumber(src.spend);

  let ctr = toNumber(src.ctr);
  if (!ctr && impressions > 0) ctr = clicks / impressions;

  let cpm = toNumber(src.cpm);
  if (!cpm && impressions > 0) cpm = (spend / impressions) * 1000;

  const roas =
    toNumber(src.roas) ||
    toNumber(src.purchase_roas) ||
    toNumber(src.website_purchase_roas);

  const purchases = toNumber(
    src.purchases ?? src.purchases_30d ?? src.purchase ?? 0
  );

  return { spend, roas, ctr, cpm, purchases };
}

/* ----------------------------------------------------------
  HEALTH SCORE
-----------------------------------------------------------*/
export function computeHealthScore(metrics) {
  if (!metrics) return { score: 0, label: "unknown" };

  const { roas, ctr, cpm, spend } = metrics;

  let score = 50;

  // ROAS
  if (roas >= 5) score += 25;
  else if (roas >= 3) score += 10;
  else if (roas <= 1.5) score -= 15;

  // CTR
  if (ctr >= 0.03) score += 15;
  else if (ctr >= 0.015) score += 5;
  else score -= 10;

  // CPM
  if (cpm <= 8) score += 10;
  else if (cpm >= 15) score -= 10;

  // Spend Bonus
  if (spend >= 15000) score += 5;

  score = Math.max(0, Math.min(100, score));

  const label =
    score >= 80 ? "Sehr gesund" :
    score >= 60 ? "Solide" :
    score >= 40 ? "Unter Beobachtung" :
    "Kritisch";

  return { score, label };
}

/* ----------------------------------------------------------
  SUMMARY
-----------------------------------------------------------*/

export function computeCampaignSummary(campaigns) {
  if (!campaigns || !campaigns.length)
    return {
      spendTotal: "€0",
      avgROAS: "0.0x",
      avgCTR: "0%",
      activeCount: 0,
      testingCount: 0,
      pausedCount: 0,
    };

  let S = 0,
    R = 0,
    C = 0;

  let A = 0,
    T = 0,
    P = 0;

  campaigns.forEach((c) => {
    const m = c.metrics;
    S += m.spend;
    R += m.roas;
    C += m.ctr;

    const status = (c.status || '').toLowerCase();
    if (status.includes('active')) A++;
    if (status.includes('paused')) P++;
    if (status.includes('testing')) T++;
  });

  const n = campaigns.length;

  return {
    spendTotal: `€${S.toLocaleString("de-DE")}`,
    avgROAS: `${(R / n).toFixed(1)}x`,
    avgCTR: `${((C / n) * 100).toFixed(1)}%`,
    activeCount: A,
    testingCount: T,
    pausedCount: P,
  };
}

/* ----------------------------------------------------------
  MAIN MODEL BUILDER
-----------------------------------------------------------*/

export function buildCampaignsModel(client) {
  if (!client) {
    return {
      campaigns: [],
      summary: computeCampaignSummary([])
    };
  }

  const rawCampaigns = client.campaigns || client.getCampaigns?.() || [];
  
  const campaigns = rawCampaigns.map((raw, i) => {
    const metrics = raw.metrics || buildDemoMetrics(raw, raw.brandId || raw.clientId || 'demo', i);
    const health = computeHealthScore(metrics);
    
    return {
      id: raw.id || raw.campaign_id || `camp_${i}`,
      name: raw.name || `Kampagne ${i + 1}`,
      status: raw.status || 'ACTIVE',
      objective: raw.objective || 'SALES',
      brandId: raw.brandId || raw.clientId || '',
      clientId: raw.clientId || raw.brandId || '',
      metrics,
      health,
      _source: raw._source || 'demo'
    };
  });

  const summary = computeCampaignSummary(campaigns);

  return {
    campaigns,
    summary
  };
}
