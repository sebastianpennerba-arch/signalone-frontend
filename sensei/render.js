// packages/sensei/render.js
// V2.0 PHASE 1 FINAL
// P1-10: Score explanation (0-39 critical, 40-69 okay, 70-100 stark)
// P1-11: Max 3 recommendations
// P1-12: Analysis state visible
// -----------------------------------------------------------------------------

/**
 * Render Entry
 * @param {HTMLElement} section
 * @param {Object|null} model - normalisierte Sensei-Analyse
 * @param {Object} [opts]
 */
export function renderSenseiView(section, model, opts = {}) {
  if (!section) return;

  // P1-12: Analysis state
  if (opts.analyzing) {
    renderAnalyzingState(section);
    return;
  }

  const hasData = !!model && Array.isArray(model.creatives) && model.creatives.length;

  if (!hasData) {
    renderEmptyState(section, opts.error);
    return;
  }

  const { totals, creatives, meta, offer, hook, recommendations } = model;

  const headerSubtitle = buildHeaderSubtitle(meta, totals);

  const html = `
    <div class="view-inner">
      <header class="view-header">
        <div>
          <div class="view-kicker">AdSensei • AI Suite</div>
          <h2 class="view-title">Daily Action Plan</h2>
          <p class="view-subtitle">${escapeHtml(headerSubtitle)}</p>
        </div>
        <div class="view-header-meta">
          ${renderModeBadge(meta)}
          ${meta && meta.createdAt ? `<span class="meta-pill">${escapeHtml(formatDate(meta.createdAt))}</span>` : ""}
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- Linke Spalte: Creative Landscape -->
        <section>
          <div class="card">
            <h3 class="card-title">Creative Landscape</h3>
            <p class="card-subtitle">
              Überblick über deine wichtigsten Creatives – inkl. ROAS, CTR, CPM & Fatigue.
            </p>

            <div class="kpi-grid">
              <div class="kpi-item">
                <div class="kpi-label">Creatives</div>
                <div class="kpi-value">${totals.totalCreatives}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Spend</div>
                <div class="kpi-value">${formatCurrency(totals.totalSpend)}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Ø ROAS</div>
                <div class="kpi-value">${formatRoas(totals.avgRoas)}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Ø CTR</div>
                <div class="kpi-value">${formatPercent(totals.avgCtr)}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Ø CPM</div>
                <div class="kpi-value">${formatCurrency(totals.avgCpm)}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Sensei Score</div>
                <div class="kpi-value">${formatScore(totals.avgScore)}</div>
              </div>
            </div>
            
            <!-- P1-10: Score Explanation -->
            <div class="score-explanation" style="
              margin-top: 1rem;
              padding: 0.75rem 1rem;
              background: #F5F5F7;
              border-radius: 8px;
              font-size: 0.8125rem;
              color: #6E6E73;
              line-height: 1.5;
            ">
              <strong style="color: #1D1D1F;">Sensei Score Bedeutung:</strong><br>
              • <strong style="color: #EF4444;">0–39:</strong> Kritisch – dringender Handlungsbedarf<br>
              • <strong style="color: #F59E0B;">40–69:</strong> Okay – Optimierungspotenzial vorhanden<br>
              • <strong style="color: #10B981;">70–100:</strong> Stark – solide Performance
            </div>
          </div>

          <div class="card" style="margin-top:16px;">
            <h3 class="card-title">Creatives mit höchstem Impact</h3>
            <p class="card-subtitle">
              Sortiert nach Sensei Score – oben siehst du deine größten Hebel.
            </p>

            <div class="creative-grid">
              ${creatives.map(renderCreativeCard).join("")}
            </div>
          </div>
        </section>

        <!-- Rechte Spalte: Offer / Hook / Recommendations -->
        <aside>
          <div class="card">
            <h3 class="card-title">Account Summary</h3>
            <p class="card-subtitle">
              Zusammenfassung der gesamten Performance, basierend auf der Sensei-Analyse.
            </p>

            <div class="kpi-grid">
              <div class="kpi-item">
                <div class="kpi-label">Revenue (ca.)</div>
                <div class="kpi-value">${formatCurrency(totals.totalRevenue)}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Spend</div>
                <div class="kpi-value">${formatCurrency(totals.totalSpend)}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">Profit Ratio</div>
                <div class="kpi-value">${formatProfitRatio(totals)}</div>
              </div>
            </div>
          </div>

          ${offer ? renderOfferCard(offer) : ""}
          ${hook ? renderHookCard(hook) : ""}
          ${renderRecommendationsCard(recommendations)}
        </aside>
      </div>
    </div>
  `;

  section.innerHTML = html;
  wireInteractions(section, model);
}

// -----------------------------------------------------------------------------
// P1-12: Analysis State
// -----------------------------------------------------------------------------

function renderAnalyzingState(section) {
  section.innerHTML = `
    <div class="view-inner">
      <header class="view-header">
        <div>
          <div class="view-kicker">AdSensei • AI Suite</div>
          <h2 class="view-title">Analyse läuft...</h2>
          <p class="view-subtitle">Sensei analysiert deine Kampagnen. Das dauert ca. 3–5 Sekunden.</p>
        </div>
      </header>

      <div class="card" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
        <div style="font-size: 1.125rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">
          Sensei denkt...
        </div>
        <div style="font-size: 0.875rem; color: #6E6E73;">
          Daten werden geladen, Creatives bewertet, Empfehlungen generiert.
        </div>
        
        <!-- Simple Loading Animation -->
        <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 0.5rem;">
          <div style="width: 8px; height: 8px; background: #4F80FF; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></div>
          <div style="width: 8px; height: 8px; background: #4F80FF; border-radius: 50%; animation: pulse 1.5s ease-in-out 0.2s infinite;"></div>
          <div style="width: 8px; height: 8px; background: #4F80FF; border-radius: 50%; animation: pulse 1.5s ease-in-out 0.4s infinite;"></div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    </style>
  `;
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function renderEmptyState(section, error) {
  const message = error
    ? "Sensei Analyse konnte nicht geladen werden."
    : "Verbinde deinen Meta Account oder aktiviere den Demo-Modus, um eine Sensei Analyse zu erhalten.";

  section.innerHTML = `
    <div class="view-inner">
      <header class="view-header">
        <div>
          <div class="view-kicker">AdSensei • AI Suite</div>
          <h2 class="view-title">Noch keine Analyse verfügbar</h2>
          <p class="view-subtitle">${escapeHtml(message)}</p>
        </div>
      </header>

      <div class="card">
        <p>
          Du kannst jederzeit im <strong>Settings</strong>-Modul den <strong>Demo-Modus</strong> aktivieren
          und bekommst ein vollständiges Sensei-Beispielbriefing mit hochwertigen Demo-Daten.
        </p>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// UI Building Blocks
// -----------------------------------------------------------------------------

function renderModeBadge(meta) {
  if (!meta) return "";
  const mode = (meta.mode || "demo").toLowerCase();
  const isDemo = mode === "demo";

  const label = isDemo ? "Demo-Analyse" : "Live-Analyse";
  const icon = isDemo ? "✨" : "🔴";
  return `<span class="meta-pill">${icon} ${label}</span>`;
}

function renderCreativeCard(c) {
  const m = c.metrics || {};
  const toneEmoji = toneToEmoji(c.tone);
  const fatigueLabel = c.fatigue ? ` • Fatigue: ${escapeHtml(c.fatigue)}` : "";

  return `
    <article class="creative-library-item" data-id="${escapeHtml(c.id)}">
      <div class="creative-info">
        <div class="creative-title-row">
          <span class="creative-title">${escapeHtml(c.name)}</span>
        </div>
        <div class="creative-kpi">
          ${toneEmoji} ${escapeHtml(c.label || "Neutral")} • Score: ${formatScore(c.score)}
        </div>
        <div class="creative-kpi">
          ROAS: ${formatRoas(m.roas)} · Spend: ${formatCurrency(m.spend)} · CTR: ${formatPercent(m.ctr)}
        </div>
        <div class="creative-kpi">
          CPM: ${formatCurrency(m.cpm)} · Purchases: ${formatNumber(m.purchases)}${fatigueLabel}
        </div>
        <div class="creative-kpi">
          🎬 Hook: ${c.hookLabel ? escapeHtml(c.hookLabel) : "Kein Hook hinterlegt."}
        </div>
        <div class="creative-kpi">
          👤 Creator: ${escapeHtml(c.creator || "Unknown")}
        </div>
      </div>
    </article>
  `;
}

function renderOfferCard(offer) {
  const issues = Array.isArray(offer.issues) ? offer.issues : [];
  const recs = Array.isArray(offer.recommendations) ? offer.recommendations : [];

  return `
    <div class="card" style="margin-top:16px;">
      <h3 class="card-title">${escapeHtml(offer.headline || "Offer & Funnel Diagnose")}</h3>
      <p class="card-subtitle">${escapeHtml(offer.summary || "")}</p>

      ${
        offer.primaryIssue
          ? `<p class="card-subtitle"><strong>Hauptproblem:</strong> ${escapeHtml(
              offer.primaryIssue,
            )}</p>`
          : ""
      }

      ${
        issues.length
          ? `
        <div style="margin-top:8px;">
          <div class="card-section-title">Auffälligkeiten</div>
          <ul class="card-list">
            ${issues
              .map((i) => `<li>${escapeHtml(i.text || i)}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        recs.length
          ? `
        <div style="margin-top:12px;">
          <div class="card-section-title">Konkrete Offer-Steps</div>
          <ul class="card-list">
            ${recs
              .map((r) => `<li>${escapeHtml(r.text || r)}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function renderHookCard(hook) {
  const patterns = Array.isArray(hook.patterns) ? hook.patterns : [];
  const recs = Array.isArray(hook.recommendations) ? hook.recommendations : [];

  return `
    <div class="card" style="margin-top:16px;">
      <h3 class="card-title">${escapeHtml(hook.headline || "Hook & Story Analyse")}</h3>
      <p class="card-subtitle">${escapeHtml(hook.summary || "")}</p>

      ${
        patterns.length
          ? `
        <div style="margin-top:8px;">
          <div class="card-section-title">Hook-Patterns</div>
          <ul class="card-list">
            ${patterns
              .map((p) => `<li>${escapeHtml(p.text || p)}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        recs.length
          ? `
        <div style="margin-top:12px;">
          <div class="card-section-title">Empfohlene Hooks & Tests</div>
          <ul class="card-list">
            ${recs
              .map((r) => `<li>${escapeHtml(r.text || r)}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
  `;
}

// P1-11: Max 3 Recommendations
function renderRecommendationsCard(recommendations) {
  const list = Array.isArray(recommendations) ? recommendations : [];
  if (!list.length) {
    return `
      <div class="card" style="margin-top:16px;">
        <h3 class="card-title">Sensei Empfehlungen</h3>
        <p class="card-subtitle">
          Keine spezifischen Empfehlungen – dein Account wirkt im Moment stabil.
        </p>
      </div>
    `;
  }

  const top = list.slice(0, 3); // P1-11: Max 3

  return `
    <div class="card" style="margin-top:16px;">
      <h3 class="card-title">Sensei Empfehlungen</h3>
      <p class="card-subtitle">
        Priorisierte Handlungsempfehlungen für heute. Setz 1–3 Punkte direkt um.
      </p>

      <ol class="card-list numbered">
        ${top
          .map((r) => {
            const text = typeof r === "string" ? r : r.text || r.description || "";
            return `<li>${escapeHtml(text)}</li>`;
          })
          .join("")}
      </ol>

      <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="meta-button" disabled title="Empfehlung – Umsetzung in Phase 2">Neu analysieren</button>
        <button class="meta-button meta-button-secondary" disabled title="Empfehlung – Umsetzung in Phase 2">Demo-Usecase anzeigen</button>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// Interactions
// -----------------------------------------------------------------------------

function wireInteractions(section, model) {
  // Phase 1: No interactions needed (buttons disabled)
}

// -----------------------------------------------------------------------------
// Formatting Helpers
// -----------------------------------------------------------------------------

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "€0";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatRoas(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "–";
  return `${n.toFixed(1)}x`;
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "–";
  const perc = n > 1 ? n : n * 100;
  return `${perc.toFixed(1)}%`;
}

function formatScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "–";
  return `${Math.round(n)}/100`;
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "–";
  return new Intl.NumberFormat("de-DE").format(n);
}

function formatProfitRatio(totals) {
  const spend = Number(totals.totalSpend) || 0;
  const rev = Number(totals.totalRevenue) || 0;
  if (!spend || !rev) return "–";
  const ratio = (rev - spend) / spend;
  return `${(ratio * 100).toFixed(1)}%`;
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toneToEmoji(tone) {
  switch (tone) {
    case "good":
      return "🟢";
    case "critical":
      return "🔴";
    case "warning":
    default:
      return "🟡";
  }
}

function buildHeaderSubtitle(meta, totals) {
  const mode =
    meta && meta.mode === "live"
      ? "Live-Analyse deines Accounts"
      : "Demo-Analyse eines Beispiel-Accounts";

  const spend = formatCurrency(totals.totalSpend);
  const roas = formatRoas(totals.avgRoas);

  return `${mode} – ${spend} Spend • Ø ROAS ${roas}`;
}
