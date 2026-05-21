export type PriceIntentKind = "max" | "min" | "range" | "approx";

export interface PriceIntent {
  kind: PriceIntentKind;
  min?: number;
  max?: number;
  approx?: number;
}

const MONEY = /\$?\s*([\d,]+(?:\.\d{1,2})?)/gi;

function parseMoney(raw: string): number | null {
  const normalized = raw.replace(/,/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

function firstMoney(text: string): number | null {
  MONEY.lastIndex = 0;
  const match = MONEY.exec(text);
  if (!match?.[1]) return null;
  return parseMoney(match[1]);
}

function allMoney(text: string): number[] {
  const values: number[] = [];
  MONEY.lastIndex = 0;
  for (const match of text.matchAll(MONEY)) {
    const value = match[1] ? parseMoney(match[1]) : null;
    if (value != null) values.push(value);
  }
  return values;
}

/** Parse budget phrases from the optional user prompt. */
export function parsePriceIntent(userPrompt?: string): PriceIntent | null {
  if (!userPrompt?.trim()) return null;

  const text = userPrompt.trim().toLowerCase();

  const between =
    text.match(
      /(?:between|from)\s+\$?\s*([\d,]+(?:\.\d{1,2})?)\s+(?:and|to|-)\s+\$?\s*([\d,]+(?:\.\d{1,2})?)/,
    ) ??
    text.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:-|–|—)\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/);

  if (between?.[1] && between[2]) {
    const min = parseMoney(between[1]);
    const max = parseMoney(between[2]);
    if (min != null && max != null) {
      return { kind: "range", min: Math.min(min, max), max: Math.max(min, max) };
    }
  }

  const approx = text.match(
    /(?:around|about|approximately|approx\.?|~)\s+\$?\s*([\d,]+(?:\.\d{1,2})?)/,
  );
  if (approx?.[1]) {
    const center = parseMoney(approx[1]);
    if (center != null) return { kind: "approx", approx: center };
  }

  const under = text.match(
    /(?:under|below|less than|at most|max(?:imum)?|up to|upto)\s+\$?\s*([\d,]+(?:\.\d{1,2})?)/,
  );
  if (under?.[1]) {
    const max = parseMoney(under[1]);
    if (max != null) return { kind: "max", max };
  }

  const over = text.match(
    /(?:over|above|more than|at least|min(?:imum)?)\s+\$?\s*([\d,]+(?:\.\d{1,2})?)/,
  );
  if (over?.[1]) {
    const min = parseMoney(over[1]);
    if (min != null) return { kind: "min", min };
  }

  // Shorthand: "under $500" may appear after other words; also catch trailing "$500 max"
  const trailingMax = text.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:max|maximum|or less)\b/);
  if (trailingMax?.[1]) {
    const max = parseMoney(trailingMax[1]);
    if (max != null) return { kind: "max", max };
  }

  const trailingMin = text.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:min|minimum|or more)\b/);
  if (trailingMin?.[1]) {
    const min = parseMoney(trailingMin[1]);
    if (min != null) return { kind: "min", min };
  }

  // If prompt is only a price with qualifier words elsewhere, e.g. "budget 500"
  if (/\b(?:budget|price|spend)\b/.test(text)) {
    const value = firstMoney(text);
    if (value != null) return { kind: "max", max: value };
  }

  return null;
}

export function priceBoundsFromIntent(
  intent: PriceIntent,
  tolerancePercent = 10,
): { min?: number; max?: number } {
  if (intent.kind === "approx" && intent.approx != null) {
    const slack = intent.approx * (tolerancePercent / 100);
    return { min: intent.approx - slack, max: intent.approx + slack };
  }

  return { min: intent.min, max: intent.max };
}

export function productMatchesPriceIntent(
  price: number,
  intent: PriceIntent,
  tolerancePercent = 10,
): boolean {
  const { min, max } = priceBoundsFromIntent(intent, tolerancePercent);
  if (min != null && price < min) return false;
  if (max != null && price > max) return false;
  return true;
}

export function describePriceIntent(intent: PriceIntent, tolerancePercent = 10): string {
  const { min, max } = priceBoundsFromIntent(intent, tolerancePercent);
  if (intent.kind === "approx" && intent.approx != null) {
    return `around $${Math.round(intent.approx)} (±${tolerancePercent}%)`;
  }
  if (min != null && max != null) {
    return `$${Math.round(min)}–$${Math.round(max)}`;
  }
  if (max != null) return `under $${Math.round(max)}`;
  if (min != null) return `over $${Math.round(min)}`;
  return "price constraint";
}
