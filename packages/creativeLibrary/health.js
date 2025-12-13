// packages/creativeLibrary/health.js
// P2 FINAL – crash-safe creative health computation

/**
 * Compute a health score and label for a creative.
 * NEVER throws, NEVER assumes input shape.
 */

export function computeCreativeHealth(creative) {
  const k = creative?.kpis || {};

  const roas = toNumber(k.roas);
  const ctr = toNumber(k.ctr);
  const spend = toNumber(k.spend);

  // base score
  let score = 0;

  if (roas >= 4) score += 50;
  else if (roas >= 2) score += 30;
  else if (roas > 0) score += 10;

  if (ctr >= 0.03) score += 25;
  else if (ctr >= 0.015) score += 15;

  if (spend >= 1000) score += 15;
  else if (spend > 0) score += 5;

  // clamp safely (THIS is where your crash was before)
  const safeScore = Number.isFinite(score) ? score : 0;
  const finalScore = Math.min(100, Math.max(0, safeScore));

  return {
    score: finalScore,
    label: labelForScore(finalScore),
    reasonShort: reasonForScore(finalScore),
    reasonLong: longReasonForScore(finalScore),
  };
}

function labelForScore(score) {
  if (score >= 75) return "Winner";
  if (score >= 50) return "Scaling Potential";
  if (score >= 30) return "Testing";
  return "Needs Attention";
}

function reasonForScore(score) {
  if (score >= 75) return "Starke Performance über alle KPIs";
  if (score >= 50) return "Solide KPIs mit Skalierungspotenzial";
  if (score >= 30) return "Noch in der Testphase";
  return "Unterdurchschnittliche Performance";
}

function longReasonForScore(score) {
  if (score >= 75)
    return "Dieses Creative zeigt starke Effizienz und stabile KPIs. Skalierung empfohlen.";
  if (score >= 50)
    return "Das Creative performt solide, sollte aber weiter beobachtet und getestet werden.";
  if (score >= 30)
    return "Performance ist noch instabil. Weitere Tests nötig.";
  return "KPIs liegen unter Erwartung. Überarbeitung oder Pausierung sinnvoll.";
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
