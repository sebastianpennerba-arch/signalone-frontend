import { fetchMetaDashboardMetrics } from "./metaClient.js";
// oder aus DB, je nach Strategie

export async function getDashboardSnapshot(brandId, { userId }) {
  // 1) Brand-Konfiguration aus DB lesen (Account-IDs, Currency, etc.)
  // 2) Meta-Daten holen (oder aus gecachten Snapshots)
  const meta = await fetchMetaDashboardMetrics(brandId);

  // 3) Auf unseren Contract mappen (den du vorhin eingefroren hast)
  return {
    brandId,
    spend30d: meta.spend30d,
    revenue30d: meta.revenue30d,
    roas30d: meta.roas30d,
    profitEst30d: meta.profitEst30d,
    deltaSpend: meta.deltaSpend,
    deltaRevenue: meta.deltaRevenue,
    deltaRoas: meta.deltaRoas,
    deltaProfit: meta.deltaProfit,
    signals: meta.signals, // bereits im richtigen Format
  };
}
