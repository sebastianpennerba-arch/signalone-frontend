// data/demo/testingLog.js
// Demo-Einträge für das Testing Log (Creative A/B Tests, Hook-Battles etc.)

export const DemoTestingLog = [
  {
    id: "test_acme_hooks_01",
    brandId: "acme",
    campaignId: "acme_testing_hooks",
    createdAt: "2025-11-30T10:15:00Z",
    hypothesis: "Problem-Lead vs Solution-Lead Hook",
    variantA: {
      creativeId: "cr_acme_1",
      label: "Problem Lead",
      metrics: { roas: 4.05, ctr: 3.8, cpm: 7.6, spend: 4_000, purchases: 260 }
    },
    variantB: {
      creativeId: "cr_acme_2",
      label: "Solution Lead",
      metrics: { roas: 3.13, ctr: 3.0, cpm: 8.9, spend: 3_800, purchases: 180 }
    },
    winner: "A",
    reason: "ROAS +0.9 und CTR +0.8pp gegenüber Variante B."
  }
];
