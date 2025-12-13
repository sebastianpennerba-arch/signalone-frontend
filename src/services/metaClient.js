import fetch from "node-fetch";
import { config } from "../config.js";

// 1) Code → AccessToken + AdAccounts (aus deinem token.js übernommen)
export async function exchangeCodeForTokenAndAccounts(code, redirectUri) {
  try {
    const appId = config.meta.appId;
    const appSecret = config.meta.appSecret;
    const configuredRedirectUri = config.meta.oauthRedirectUri;

    if (!appId || !appSecret || !configuredRedirectUri) {
      return {
        success: false,
        error:
          "Server misconfigured. META_APP_ID, META_APP_SECRET or META_OAUTH_REDIRECT_URI missing."
      };
    }

    const finalRedirectUri = redirectUri || configuredRedirectUri;

    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: finalRedirectUri,
      code
    });

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Meta token error:", tokenJson);
      return {
        success: false,
        error: "Meta token exchange failed",
        meta: tokenJson
      };
    }

    const { access_token, token_type, expires_in } = tokenJson;
    if (!access_token) {
      return {
        success: false,
        error: "No access_token returned from Meta",
        meta: tokenJson
      };
    }

    // AdAccounts direkt holen
    let adAccounts = [];
    try {
      const adAccountUrl = new URL("https://graph.facebook.com/v19.0/me/adaccounts");
      adAccountUrl.searchParams.set(
        "fields",
        "id,account_id,name,account_status,timezone_name,currency"
      );
      adAccountUrl.searchParams.set("access_token", access_token);

      const adRes = await fetch(adAccountUrl.toString());
      const adJson = await adRes.json();

      if (adRes.ok && Array.isArray(adJson.data)) {
        adAccounts = adJson.data;
      } else {
        console.warn("Meta adaccounts error:", adJson);
      }
    } catch (err) {
      console.warn("Error fetching adaccounts:", err);
    }

    return {
      success: true,
      accessToken: access_token,
      tokenType: token_type,
      expiresIn: expires_in,
      adAccounts
    };
  } catch (err) {
    console.error("exchangeCodeForTokenAndAccounts unexpected:", err);
    return { success: false, error: "Internal server error" };
  }
}

// 2) Weitere Meta-Helper
export async function fetchMetaUser(accessToken) {
  const url = new URL("https://graph.facebook.com/v19.0/me");
  url.searchParams.set("fields", "id,name");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  return res.json();
}

export async function fetchMetaAdAccounts(accessToken) {
  const url = new URL("https://graph.facebook.com/v19.0/me/adaccounts");
  url.searchParams.set(
    "fields",
    "id,account_id,name,account_status,timezone_name,currency"
  );
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  return res.json();
}

export async function fetchMetaCampaigns(accountId, accessToken) {
  const url = new URL(
    `https://graph.facebook.com/v19.0/act_${accountId}/campaigns`
  );
  url.searchParams.set(
    "fields",
    "id,name,status,objective,created_time,effective_status"
  );
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  return res.json();
}

export async function fetchMetaAds(accountId, accessToken) {
  const url = new URL(`https://graph.facebook.com/v19.0/act_${accountId}/ads`);
  url.searchParams.set(
    "fields",
    "id,name,status,configured_status,effective_status"
  );
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  return res.json();
}

export async function fetchMetaInsightsForCampaign(
  campaignId,
  timeRangePreset,
  accessToken
) {
  const url = new URL(
    `https://graph.facebook.com/v19.0/${campaignId}/insights`
  );
  url.searchParams.set(
    "fields",
    "spend,impressions,clicks,actions,action_values,objective"
  );

  // Beispiel-Presets (kannst du später besser machen)
  if (timeRangePreset === "last_7d") {
    url.searchParams.set("date_preset", "last_7d");
  } else if (timeRangePreset === "yesterday") {
    url.searchParams.set("date_preset", "yesterday");
  } else {
    url.searchParams.set("date_preset", "last_30d");
  }

  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  return res.json();
}
