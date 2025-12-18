// data/demo/campaigns.js
// Demo-Kampagnen, nach Brand gruppiert.

export const DemoCampaigns = {
  acme: [
    {
      id: "acme_scaling_01",
      name: "Scaling – UGC Broad",
      status: "ACTIVE",
      objective: "PURCHASE",
      createdAt: "2025-10-15",
      spend: 32_450,
      revenue: 187_320,
      roas: 5.8,
      ctr: 3.9,
      cpm: 7.9,
      purchases: 1_765
    },
    {
      id: "acme_testing_hooks",
      name: "Hook Battle – Q4",
      status: "ACTIVE",
      objective: "PURCHASE",
      createdAt: "2025-11-02",
      spend: 9_840,
      revenue: 31_220,
      roas: 3.2,
      ctr: 3.4,
      cpm: 8.7,
      purchases: 512
    }
  ],
  tech: [
    {
      id: "tech_bf_scaling",
      name: "Black Friday Scaling",
      status: "ACTIVE",
      objective: "PURCHASE",
      createdAt: "2025-11-08",
      spend: 43_210,
      revenue: 211_880,
      roas: 4.9,
      ctr: 3.0,
      cpm: 9.4,
      purchases: 1_234
    }
  ],
  beauty: [
    {
      id: "beauty_alwayson",
      name: "Always-On Prospecting",
      status: "ACTIVE",
      objective: "PURCHASE",
      createdAt: "2025-10-05",
      spend: 18_300,
      revenue: 76_440,
      roas: 4.2,
      ctr: 2.8,
      cpm: 7.2,
      purchases: 879
    }
  ]
};
