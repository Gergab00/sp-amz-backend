export interface CatalogItemSummary {
  marketplaceId: string;
  brandName?: string;
  browseClassification?: string;
  color?: string;
  itemName?: string;
  manufacturer?: string;
  modelNumber?: string;
  size?: string;
  style?: string;
}

export interface CatalogItemIdentifier {
  identifierType: string;
  identifier: string;
}

export interface CatalogItemImage {
  link: string;
  height?: number;
  width?: number;
  variant?: string;
}

export interface CatalogItemDimension {
  name: string;
  value: number;
  unit: string;
}

export interface CatalogItemClassification {
  marketplaceId: string;
  classificationId: string;
  title?: string;
  link?: string;
}

export interface CatalogItemSalesRank {
  marketplaceId: string;
  classificationRanks: Array<{
    classificationId: string;
    title: string;
    link?: string;
    rank: number;
  }>;
}

export interface CatalogItemRelationship {
  type: string;
  identifiers?: CatalogItemIdentifier[];
}

export interface SpapiCatalogItemResponse {
  asin: string;
  attributes?: Record<string, any>;
  classifications?: CatalogItemClassification[];
  dimensions?: CatalogItemDimension[];
  identifiers?: CatalogItemIdentifier[];
  images?: CatalogItemImage[];
  productTypes?: string[];
  relationships?: CatalogItemRelationship[];
  salesRanks?: CatalogItemSalesRank[];
  summaries?: CatalogItemSummary[];
}

export interface CatalogItemDomain {
  asin: string;
  title: string;
  brand: string;
  attributes: Record<string, any>;
  classifications: CatalogItemClassification[];
  dimensions: CatalogItemDimension[];
  identifiers: CatalogItemIdentifier[];
  images: CatalogItemImage[];
  productTypes: string[];
  relationships: CatalogItemRelationship[];
  salesRanks: CatalogItemSalesRank[];
  summaries: CatalogItemSummary[];
}