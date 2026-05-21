import type { EnrichedProduct, Product } from "../types.js";

function normalizeToken(value: string): string {
  return value.trim();
}

/**
 * Title template: `{Style} {Material} {Type}`
 * Type may be multi-word (e.g. "Entryway Bench", "Wide Bookshelf").
 */
export function parseTitleAttrs(
  title: string,
  knownType: string,
): { style: string; material: string } {
  const typeTokens = knownType.split(/\s+/).filter(Boolean);
  const titleTokens = title.split(/\s+/).filter(Boolean);

  if (titleTokens.length < typeTokens.length + 2) {
    return {
      style: titleTokens[0] ?? "",
      material: titleTokens.slice(1, -typeTokens.length).join(" "),
    };
  }

  const style = normalizeToken(titleTokens[0] ?? "");
  const materialTokens = titleTokens.slice(1, titleTokens.length - typeTokens.length);
  const material = materialTokens.map(normalizeToken).join(" ");

  return { style, material };
}

/**
 * Description template: `{Color} {style} {type} made from premium {material}. ...`
 */
export function parseDescriptionColor(description: string): string {
  const first = description.split(/\s+/)[0] ?? "";
  return normalizeToken(first);
}

export function enrichProduct(product: Product): EnrichedProduct {
  const { style, material } = parseTitleAttrs(product.title, product.type);
  const color = parseDescriptionColor(product.description);

  return {
    ...product,
    _attrs: { style, material, color },
  };
}

export function enrichProducts(products: Product[]): EnrichedProduct[] {
  return products.map(enrichProduct);
}
