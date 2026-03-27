import {
  CatalogItemDomain,
  SpapiCatalogItemResponse,
} from '../../domain/types/catalog-item.types';

export class CatalogItemMapper {
  static toDomain(response: SpapiCatalogItemResponse): CatalogItemDomain {
    return {
      asin: response.asin,
      title:
        response.attributes?.item_name?.[0]?.value ||
        response.summaries?.[0]?.itemName ||
        'Sin título',
      brand:
        response.attributes?.brand?.[0]?.value ||
        response.summaries?.[0]?.brandName ||
        'Sin marca',
      attributes: response.attributes || {},
      classifications: response.classifications || [],
      dimensions: response.dimensions || [],
      identifiers: response.identifiers || [],
      images: response.images || [],
      productTypes: response.productTypes || [],
      relationships: response.relationships || [],
      salesRanks: response.salesRanks || [],
      summaries: response.summaries || [],
    };
  }
}

/**
 * asin: 'B0BSML338D',
      attributes: [Object],
      classifications: [Array],
      dimensions: [Array],
      identifiers: [Array],
      images: [Array],
      productTypes: [Array],
      relationships: [Array],
      salesRanks: [Array],
      summaries: [Array]
 */
