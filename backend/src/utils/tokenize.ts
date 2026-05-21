const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "in",
  "on",
  "with",
  "and",
  "or",
  "for",
  "of",
  "to",
  "is",
  "are",
  "was",
  "were",
  "it",
  "this",
  "that",
  "from",
  "by",
  "at",
  "as",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}
