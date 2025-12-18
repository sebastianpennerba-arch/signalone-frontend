// packages/sensei/dashboard.js
// Submodul 1 – Sensei Overview / "AI Layer" Dashboard
// ✅ PHASE 1 FIX: Score calculation unified with main Sensei module

function getNumbers(brand, senseiScore) {
  if (!brand) {
    return {
      spend30d: 0,
      roas30d: 0,
      estRevenue: 0,
      score: 0,
      scoreLabel: "n/a",
    };
  }

  const spend30d = brand.spend30d || 0;
  const roas30d = brand.roas30d || 0;
  const estRevenue = spend30d * roas30d;

  // ✅ FIX: Use unified score from Sensei compute layer
  const score = Number.isFinite(senseiScore) ? senseiScore : 0;
  
  let scoreLabel = "Unbekannt";
  
  // P1-10: Score ranges (0-39 critical, 40-69 okay, 70-100 stark)
  if (score >= 70) {
    scoreLabel = "Stark";
  } else if (score >= 40) {
    scoreLabel = "Beobachten";
  } else if (score > 0) {
    scoreLabel = "Kritisch";
  }

  return { spend30d, roas30d, estRevenue, score, scoreLabel };
}

export function renderSenseiOverview(root, AppState, DemoData, ctx) {
  const brand = ctx.brand || null;
  const campaign = ctx.campaign || null;
  
  // ✅ FIX: Get Sensei score from context (computed by main module)
  const senseiScore = ctx.senseiScore || 0;

  const { spend30d, roas30d, estRevenue, score, scoreLabel } = getNumbers(brand, senseiScore);

  const section = document.createElement("section");
  section.className = "sensei-layout";

  section.innerHTML = `
    <div class="sensei-main">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">AD SPEND · LETZTE 30 TAGE</div>
          <div class="metric-value">${spend30d.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          })}</div>
          <div class="metric-subtext">
            Basierend auf ${
              ctx.isDemo ? "Meta Demo-Daten" : "aktuellen Meta-Daten"
            } für ${
    brand ? brand.name : "kein ausgewähltes Werbekonto"
  }.
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">ROAS · LETZTE 30 TAGE</div>
          <div class="metric-value">${roas30d.toFixed(1)}x</div>
          <div class="metric-subtext">
            Geschätzter Umsatz: ${estRevenue.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">SENSEI SCORE</div>
          <div class="metric-value" style="color: ${getScoreColor(score)};">${
            score > 0 ? Math.round(score) : "n/a"
          }</div>
          <div class="metric-subtext">
            ${scoreLabel}${campaign ? ` · Kampagne: ${campaign.name}` : ""}
          </div>
        </div>
      </div>

      <div class="sensei-card" style="margin-top: 24px;">
        <div class="sensei-card-header">
          <div>
            <div class="sensei-card-title">Sensei · Executive Summary</div>
            <div class="sensei-card-subtitle">
              Sofort-Lagebild und High-Level Handlungsempfehlungen.
            </div>
          </div>
          <span class="sensei-ai-pill">
            <i class="fa-solid fa-bolt"></i> KI-Auswertung
          </span>
        </div>

        <p style="margin-bottom: 10px;">
          Für <strong>${brand ? brand.name : "dein Konto"}</strong>${
    campaign ? ` (Kampagne: <strong>${campaign.name}</strong>)` : ""
  } sieht Sensei aktuell folgendes:
        </p>

        <ul style="margin-left: 16px; margin-bottom: 12px;">
          <li>Spend-Level ist ${
            spend30d > 50000 ? "hoch" : spend30d > 20000 ? "solide" : "moderat"
          } – genug Daten für belastbare Entscheidungen.</li>
          <li>ROAS von <strong>${roas30d.toFixed(
            1
          )}x</strong> deutet auf klare Hebel über Creatives und Struktur hin.</li>
          <li>Sensei Score: <strong>${score > 0 ? Math.round(score) : "n/a"}/100</strong> (${scoreLabel}) – ${
    score >= 70 
      ? "starke Performance, weiter skalieren" 
      : score >= 40 
        ? "gezieltes Testing empfohlen"
        : score > 0
          ? "dringende Optimierung nötig"
          : "Daten werden analysiert"
  }.</li>
        </ul>

        <!-- P1-10: Score Explanation (consistent with main module) -->
        <div style="
          margin: 1rem 0;
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

        <div class="sensei-prompt-area">
          <label for="senseiOverviewPrompt" style="font-size:0.8rem;color:#64748b;">
            Eigene Frage an Sensei (Strategie, Struktur, Creatives):
          </label>
          <textarea
            id="senseiOverviewPrompt"
            class="sensei-prompt-textarea"
            placeholder="Beispiel: 'Gib mir eine neue Kampagnenstruktur für Q1 mit Fokus auf UGC und Hook-Testing.'"
          ></textarea>
          <button type="button" class="sensei-generate-button" id="senseiOverviewGenerate">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            Antwort generieren (Demo)
          </button>
        </div>

        <div id="senseiOverviewResponse" style="margin-top:14px;font-size:0.86rem;color:#4b5563;display:none;">
        </div>
      </div>
    </div>

    <aside class="sensei-sidebar">
      <div class="sensei-card">
        <div class="sensei-card-header">
          <div>
            <div class="sensei-card-title">Sensei Snapshot</div>
            <div class="sensei-card-subtitle">Meta-Level Übersicht</div>
          </div>
        </div>
        <ul style="margin-left: 16px;">
          <li><strong>Konto:</strong> ${brand ? brand.name : "noch nicht gewählt"}</li>
          <li><strong>Vertikale:</strong> ${
            brand ? brand.vertical : "—"
          }</li>
          <li><strong>Demo/Live:</strong> ${ctx.isDemo ? "Demo" : "Live"}</li>
          <li><strong>Aktive Kampagnen:</strong> ${
            brand && DemoData.campaignsByBrand && DemoData.campaignsByBrand[brand.id]
              ? DemoData.campaignsByBrand[brand.id].length
              : 0
          }</li>
          <li><strong>Health Score:</strong> <span style="color: ${getScoreColor(score)};">${score > 0 ? Math.round(score) : "n/a"}/100</span></li>
        </ul>
      </div>

      <div class="sensei-card" style="margin-top: 18px;">
        <div class="sensei-card-header">
          <div>
            <div class="sensei-card-title">Quick Actions</div>
            <div class="sensei-card-subtitle">1-Klick-Einstiege</div>
          </div>
        </div>
        <ul style="margin-left: 16px;">
          <li>📊 Struktur-Review für Top-Kampagne</li>
          <li>🎯 Zielgruppen-Overlap Check</li>
          <li>🎥 Creative Hook Heatmap</li>
          <li>💰 Budget-Neuverteilung nach ROAS</li>
        </ul>
      </div>
    </aside>
  `;

  root.appendChild(section);

  // Interaktiv: Demo-"Antwort" für Prompt
  const promptEl = section.querySelector("#senseiOverviewPrompt");
  const generateBtn = section.querySelector("#senseiOverviewGenerate");
  const responseEl = section.querySelector("#senseiOverviewResponse");

  if (generateBtn && promptEl && responseEl) {
    generateBtn.addEventListener("click", () => {
      const value = String(promptEl.value || "").trim();
      if (!value) {
        if (window.SignalOne && window.SignalOne.showToast) {
          window.SignalOne.showToast(
            "Bitte eine konkrete Frage an Sensei eingeben.",
            "warning"
          );
        }
        return;
      }

      responseEl.style.display = "block";
      responseEl.innerHTML = `
        <strong>Sensei (Demo-Antwort):</strong>
        <p style="margin-top:6px;">
          Basierend auf deinem aktuellen Setup für <strong>${
            brand ? brand.name : "dein Konto"
          }</strong>${
        campaign ? ` und der Kampagne <strong>${campaign.name}</strong>` : ""
      }
          würde Sensei die Frage wie folgt angehen:
        </p>
        <ol style="margin-top:8px;margin-left:18px;">
          <li>Saubere Trennung von <strong>Prospecting / Testing / Scaling</strong>.</li>
          <li>Aufsetzen eines dedizierten <strong>Creative-Testing-Stacks</strong> mit 3–5 Hooks.</li>
          <li>Strukturierte <strong>Budget-Zuteilung</strong> entlang der Performance-Level (Top 20% Creatives hochfahren).</li>
          <li>Aufsetzen eines wöchentlichen <strong>Sensei-Reviews</strong> (Alerts + Testing-Log).</li>
        </ol>
        <p style="margin-top:6px;color:#6b7280;">
          Hinweis: Dies ist eine <strong>statische Demo-Antwort</strong>. In Live wird Sensei echte
          Meta-Daten und dein Testing-Log auswerten.
        </p>
      `;

      if (window.SignalOne && window.SignalOne.showToast) {
        window.SignalOne.showToast("Sensei Demo-Antwort generiert.", "success");
      }
    });
  }
}

// ✅ P1-10: Unified score color helper (same as main module)
function getScoreColor(score) {
  if (score >= 70) return '#10B981'; // Green
  if (score >= 40) return '#F59E0B'; // Orange
  if (score > 0) return '#EF4444';   // Red
  return '#6E6E73'; // Gray (no data)
}
