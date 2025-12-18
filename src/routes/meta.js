import { Router } from "express";
import { config } from "../config.js";
import {
  exchangeCodeForTokenAndAccounts,
  fetchMetaUser,
  fetchMetaAdAccounts,
  fetchMetaCampaigns,
  fetchMetaAds,
  fetchMetaInsightsForCampaign
} from "../services/metaClient.js";

const router = Router();

// POST /api/meta/oauth/token
router.post("/oauth/token", async (req, res) => {
  try {
    const { code, redirectUri } = req.body || {};
    if (!code) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing 'code' in body." });
    }

    const result = await exchangeCodeForTokenAndAccounts(
      code,
      redirectUri || config.meta.oauthRedirectUri
    );

    if (!result.success) {
      return res.status(400).json({ ok: false, error: result.error, meta: result.meta });
    }

    return res.status(200).json({
      ok: true,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
      adAccounts: result.adAccounts
    });
  } catch (err) {
    console.error("Meta oauth token error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/meta/me
router.post("/me", async (req, res) => {
  try {
    const { accessToken } = req.body || {};
    const data = await fetchMetaUser(accessToken);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("Meta me error:", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

// POST /api/meta/adaccounts
router.post("/adaccounts", async (req, res) => {
  try {
    const { accessToken } = req.body || {};
    const data = await fetchMetaAdAccounts(accessToken);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("Meta adaccounts error:", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

// POST /api/meta/campaigns/:accountId
router.post("/campaigns/:accountId", async (req, res) => {
  try {
    const { accessToken } = req.body || {};
    const { accountId } = req.params;
    const data = await fetchMetaCampaigns(accountId, accessToken);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("Meta campaigns error:", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

// POST /api/meta/ads/:accountId
router.post("/ads/:accountId", async (req, res) => {
  try {
    const { accessToken } = req.body || {};
    const { accountId } = req.params;
    const data = await fetchMetaAds(accountId, accessToken);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("Meta ads error:", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

// POST /api/meta/insights/:campaignId
router.post("/insights/:campaignId", async (req, res) => {
  try {
    const { accessToken, timeRangePreset } = req.body || {};
    const { campaignId } = req.params;
    const data = await fetchMetaInsightsForCampaign(
      campaignId,
      timeRangePreset,
      accessToken
    );
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("Meta insights error:", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

export default router;
