import { demoCreatives } from "./creatives.js";

export const creativesByBrand = demoCreatives.reduce((acc, creative) => {
  if (!acc[creative.brandId]) acc[creative.brandId] = [];
  acc[creative.brandId].push(creative);
  return acc;
}, {});
