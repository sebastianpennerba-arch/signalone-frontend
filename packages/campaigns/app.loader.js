/* ============================================================================
   Titanium Module Loader V1
   Universelles Ladesystem für SignalOne Modules
   ============================================================================ */

console.log("%c[TitaniumLoader] Ready", "color:#7dd3fc;font-weight:bold;");

export const ModuleCache = {}; // verhindert Doppel-Imports

/**
 * Modul laden + initialisieren
 * Wichtig:
 * - moduleName = "campaigns" → sucht /packages/campaigns/index.js
 */
export async function loadModule(moduleName, ctx = {}) {
  if (!moduleName) {
    console.warn("[Loader] Kein Modulname übergeben.");
    return;
  }

  const path = `/packages/${moduleName}/index.js`;

  // Cache-check
  if (ModuleCache[moduleName]) {
    console.log(`[Loader] Reusing cached module: ${moduleName}`);
    tryInitModule(ModuleCache[moduleName], moduleName, ctx);
    return;
  }

  console.log(`[Loader] Importing ${path} ...`);

  try {
    const mod = await import(path);
    ModuleCache[moduleName] = mod;

    console.log(
      `%c[Loader] Modul geladen: ${moduleName}`,
      "color:#86efac;font-weight:bold;"
    );

    tryInitModule(mod, moduleName, ctx);
  } catch (err) {
    console.error(`[Loader] Fehler beim Importieren von ${moduleName}`, err);
    showLoaderError(moduleName, err);
  }
}

/* ============================================================================
   Modul-Initialisierung
   ============================================================================ */

function tryInitModule(mod, name, ctx) {
  if (!mod) {
    console.warn(`[Loader] Modul '${name}' leer oder fehlerhaft.`);
    return;
  }

  if (typeof mod.init === "function") {
    try {
      mod.init(ctx);
    } catch (err) {
      console.error(`[Loader] init() Fehler in Modul: ${name}`, err);
    }
  }

  if (typeof mod.render === "function") {
    try {
      // section: id = `${moduleName}View`
      const section = document.getElementById(`${name}View`);
      if (!section) {
        console.warn(
          `[Loader] Kein View-Element gefunden: #${name}View – wird übersprungen.`
        );
      } else {
        mod.render(section, ctx.AppState || {}, ctx);
      }
    } catch (err) {
      console.error(`[Loader] render() Fehler in Modul: ${name}`, err);
    }
  }
}

/* ============================================================================
   Hilfen
   ============================================================================ */

function showLoaderError(modName, err) {
  const msg = `
    <div style="padding:20px;color:#ef4444;">
      <h2>⚠ Modul konnte nicht geladen werden</h2>
      <p><strong>${modName}</strong> konnte nicht importiert werden.</p>
      <p>${err?.message || err}</p>
    </div>
  `;
  const el = document.getElementById(`${modName}View`);
  if (el) el.innerHTML = msg;
}

/* ============================================================================
   Global Access
   ============================================================================ */

window.SignalOne = window.SignalOne || {};
window.SignalOne.loadModule = loadModule;
window.SignalOne.ModuleCache = ModuleCache;

console.log(
  "%c[TitaniumLoader] Activated",
  "color:#f472b6;font-weight:bold;font-size:14px;"
);
