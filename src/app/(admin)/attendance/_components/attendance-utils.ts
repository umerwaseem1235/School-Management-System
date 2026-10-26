/** "Main Campus — Gulberg" → "Main", "DHA Phase 5 Campus" → "DHA Phase 5". */
export function shortCampus(name: string) {
  return name
    .replace(/^Main Campus(\s*[-—–]\s*Gulberg)?$/i, "Main")
    .replace(/^Main Campus\s*[-—–]\s*/i, "")
    .replace(/\s+Campus$/i, "")
    .replace(/^Campus\s+/i, "")
    .trim();
}

export const TODAY_LABEL = "Monday, 12 October 2026";
