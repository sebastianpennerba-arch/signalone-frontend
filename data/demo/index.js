// data/demo/index.js
// Aggregator für ALLE Demo-Daten – Titanium FIX

import { DemoBrands } from "./brands.js";
import { DemoCampaigns } from "./campaigns.js";

// ❗ Deine Datei exportiert "demoCreatives", NICHT "DemoCreatives"
import { demoCreatives } from "./creatives.js";

// ❗ creativesByBrand liegt in eigener Datei – MUSS importiert werden
import { creativesByBrand } from "./creativesByBrand.js";

import { DemoTestingLog } from "./testingLog.js";
import { DemoDashboard } from "./dashboard.js";

export const DemoData = {
  brands: DemoBrands,
  campaigns: DemoCampaigns,

  // ❗ jetzt korrekt benannt
  creatives: demoCreatives,

  // ❗ wichtig für DataLayer.fetchCreativesForBrand:
  creativesByBrand: creativesByBrand,

  testingLog: DemoTestingLog,
  dashboard: DemoDashboard
};
