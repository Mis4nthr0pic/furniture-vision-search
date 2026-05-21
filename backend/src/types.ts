export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  width: number;
  height: number;
  depth: number;
}

export interface EnrichedProduct extends Product {
  _attrs: {
    style: string;
    material: string;
    color: string;
  };
}

export interface CatalogVocab {
  categories: string[];
  types: string[];
  styles: string[];
  materials: string[];
  colors: string[];
  priceRange: { min: number; max: number };
  dimRanges: {
    width: { min: number; max: number };
    height: { min: number; max: number };
    depth: { min: number; max: number };
  };
}

export interface CatalogMeta extends CatalogVocab {
  productCount: number;
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  embeddingsReady: boolean;
  embeddingsItemCount: number;
  embeddingsLastIndexed: string | null;
}
