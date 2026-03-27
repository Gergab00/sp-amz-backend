import { SearchCatalogItemsDto } from '../../application/dto/search-catalog-items.dto';

export class SearchCatalogItemsParamsAdapter {
  static fromDto(dto: SearchCatalogItemsDto): any {
    const {
      marketplaceIds,
      identifiers,
      identifiersType,
      sellerId,
      keywords,
      brandNames,
      classificationIds,
      keywordsLocale,
      includedData,
      locale,
      pageSize,
      pageToken,
    } = dto;

    // SECTION: valores por defecto para includedData
    const defaultIncludedData = [
      'attributes',
      'classifications',
      'dimensions',
      'identifiers',
      'summaries',
      'images',
      'productTypes',
      'relationships',
      'salesRanks',
    ];
    const query: Record<string, any> = {
      marketplaceIds: marketplaceIds.join(','),
      includedData:
        includedData && includedData.length > 0
          ? includedData.join(',')
          : defaultIncludedData.join(','),
    };
    if (locale) query.locale = locale;
    if (pageSize) query.pageSize = pageSize;
    if (pageToken) query.pageToken = pageToken;
    if (identifiersType && identifiers && identifiers.length > 0) {
      query.identifiers = identifiers.join(',');
      query.identifiersType = identifiersType;
      if (sellerId) query.sellerId = sellerId;
    }
    if (keywords && keywords.length > 0) {
      query.keywords = keywords.join(',');
      if (brandNames && brandNames.length > 0)
        query.brandNames = brandNames.join(',');
      if (classificationIds && classificationIds.length > 0)
        query.classificationIds = classificationIds.join(',');
      if (keywordsLocale) query.keywordsLocale = keywordsLocale;
    }
    return {
      endpoint: 'catalogItems',
      operation: 'searchCatalogItems',
      query,
      options: { version: '2022-04-01' },
    };
  }
}

// INSTRUCCIONES PARA CAMBIO DE SDK:
// -------------------------------------------------------------------
// 1. Mientras uses el SDK actual (amazon-sp-api), este adapter debe devolver un objeto con:
//      {
//        endpoint: 'catalogItems',
//        operation: 'searchCatalogItems',
//        query: { ... },
//        options: { version: '2022-04-01' }
//      }
//
// 2. Si cambias a un SDK como @amazon-sp-api-release/amazon-sp-api-sdk-js:
//    - Cambia este adapter para devolver un objeto plano con los parámetros que espera el nuevo SDK, por ejemplo:
//        {
//          marketplaceIds: 'A1AM78C64UM0Y8',
//          includedData: 'summaries,images',
//          keywords: 'barbie',
//          ...otros parámetros...
//        }
//    - Cambia la implementación de SpapiClient para llamar directamente al método del nuevo SDK, por ejemplo:
//        spApi.searchCatalogItems(params)
//    - El caso de uso NO necesita cambiar, solo este adapter y el cliente.
//
// 3. Así, tu dominio y casos de uso permanecen desacoplados del SDK y solo cambias infraestructura.
