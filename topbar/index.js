export const meta = {
  id: "topbar",
  title: "Topbar Controller",
  requiresMeta: false
};

import { initTopbarEvents } from "./events.js";

export async function load(ctx) {
  // nichts zu laden
}

export async function render() {
  // nichts zu rendern
}

export function mount(root, ctx) {
  initTopbarEvents(ctx);
}

export function destroy() {
  // nichts zu zerstören
}
