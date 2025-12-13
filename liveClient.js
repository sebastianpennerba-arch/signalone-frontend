// liveClient.js
// Live-Daten-Client für SignalOne – spricht mit deinem Backend (Hetzner)

const DEFAULT_API_BASE =
  (window.SignalOneConfig && window.SignalOneConfig.apiBaseUrl) ||
  "http://localhost:8787";

function getAuthHeaders() {
  // später z.B. JWT oder Session-Cookie
  const headers = {
    "Content-Type": "application/json",
  };

  // Beispiel: Meta- bzw. User-Token im LocalStorage
  const token = localStorage.getItem("SIGNALONE_AUTH_TOKEN");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function apiGet(path) {
  const url = `${DEFAULT_API_BASE}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include", // falls du Cookies nutzt
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[LiveClient] API error", res.status, text);
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export const LiveClient = {
  // Brand-Liste für Dropdown
  async getBrands() {
    return apiGet("/api/brands");
  },

  // Dashboard-KPIs (Summary)
  async getDashboardSnapshot(brandId) {
    return apiGet(`/api/dashboard/${encodeURIComponent(brandId)}/summary`);
  },

  // ROAS-Tendenz (7 Tage)
  async getPerformanceTrend(brandId) {
    return apiGet(`/api/dashboard/${encodeURIComponent(brandId)}/trend`);
  },

  // Kampagnen
  async getCampaignsByBrand(brandId) {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : "";
    return apiGet(`/api/campaigns${q}`);
  },

  // Creatives
  async getCreativesByBrand(brandId) {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : "";
    return apiGet(`/api/creatives${q}`);
  },

  // Testing-Log
  async getTestingLogByBrand(brandId) {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : "";
    return apiGet(`/api/testing${q}`);
  },

  // Sensei-Insights
  async getSenseiInsights(brandId) {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : "";
    return apiGet(`/api/sensei${q}`);
  },

  // Meta-Verbindungsstatus (für UI-Indicator)
  async getMetaStatus() {
    return apiGet("/auth/meta/status");
  },
};

// Globale Registrierung – kompatibel zu getDataClient() in app.js
if (typeof window !== "undefined") {
  window.SignalOneLiveClient = LiveClient;
}
