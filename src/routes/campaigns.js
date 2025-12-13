import { Router } from "express";
import {
  fetchMetaCampaigns,
  fetchMetaInsightsForCampaign
} from "../services/metaClient.js";
import { mapMetaCampaignsToTitaniumCampaigns } from "../mappers/campaignsMapper.js";

const router = Router();

// GET /api/campaigns?brandId=...&accountId=...&accessToken=...
router.get("/", async (req, res) => {
  try {
    const { brandId, accountId, accessToken } = req.query;

    const campaignsJson = await fetchMetaCampaigns(accountId, accessToken);
    const metaCampaigns = campaignsJson.data || [];

    // Insights für jede Kampagne holen – später optimieren/batchen
    const insightsByCampaignId = {};
    for (const c of metaCampaigns) {
      const insightsJson = await fetchMetaInsightsForCampaign(
        c.id,
        "last_30d",
        accessToken
      );
      insightsByCampaignId[c.id] = insightsJson.data || [];
    }

    const mapped = mapMetaCampaignsToTitaniumCampaigns(
      metaCampaigns,
      insightsByCampaignId,
      brandId
    );

    res.json(mapped);
  } catch (err) {
    console.error("campaigns route error:", err);
    res.status(500).json({ error: "Campaigns fetch failed" });
  }
});

export default router;
