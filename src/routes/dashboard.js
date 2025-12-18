import { Router } from "express";
import { fetchMetaInsightsForCampaign } from "../services/metaClient.js";
import { mapMetaInsightsToDashboardSnapshot } from "../mappers/dashboardMapper.js";

const router = Router();

// GET /api/dashboard/:brandId/summary
router.get("/:brandId/summary", async (req, res) => {
  try {
    const { brandId } = req.params;
    const { accessToken, campaignId } = req.query;

    // In Realität: brandId -> accountId, defaultCampaign aus DB
    const metaInsights = await fetchMetaInsightsForCampaign(
      campaignId,
      "last_30d",
      accessToken
    );

    const snapshot = mapMetaInsightsToDashboardSnapshot(
      metaInsights.data || [],
      brandId
    );

    res.json(snapshot);
  } catch (err) {
    console.error("dashboard summary error:", err);
    res.status(500).json({ error: "Dashboard summary failed" });
  }
});

export default router;
