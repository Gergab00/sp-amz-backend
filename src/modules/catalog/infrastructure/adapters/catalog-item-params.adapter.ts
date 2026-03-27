import { GetCatalogItemDto } from '../../application/dto/get-catalog-item.dto';

export class CatalogItemParamsAdapter {
  static fromDto(dto: GetCatalogItemDto, asin: string): any {
    return {
      endpoint: 'catalogItems',
      operation: 'getCatalogItem',
      path: { asin },
      query: {
        marketplaceIds: dto.marketplaceIds || ['A1AM78C64UM0Y8'],
        includedData: dto.includedData?.length
          ? dto.includedData
          : [
              'attributes',
              'classifications',
              'dimensions',
              'identifiers',
              'images',
              'productTypes',
              'salesRanks',
              'summaries',
              'relationships',
            ],
        locale: dto.locale,
      },
      options: { version: '2022-04-01' },
    };
  }
}

// INSTRUCCIONES PARA CAMBIAR EL SDK DE AMAZON SP-API
// ---------------------------------------------------
// 1. Mientras uses el SDK actual (amazon-sp-api), este adapter debe devolver un objeto con la estructura:
//    {
//      endpoint: 'catalogItems',
//      operation: 'getCatalogItem',
//      path: { asin },
//      query: { ... },
//      options: { version: '2022-04-01' }
//    }
//
// 2. Cuando cambies a un SDK como @amazon-sp-api-release/amazon-sp-api-sdk-js:
//    - Cambia este adapter para devolver un objeto plano con los parámetros que espera el nuevo SDK, por ejemplo:
//      {
//        marketplaceIds: 'A1AM78C64UM0Y8',
//        includedData: 'summaries,images',
//        locale: 'es_MX',
//        asin: 'B0FMKR648C'
//      }
//    - Cambia la implementación de SpapiClient para llamar directamente al método del nuevo SDK, por ejemplo:
//        spApi.getCatalogItem(params)
//    - El caso de uso NO necesita cambiar, solo este adapter y el cliente.
//
// 3. Así, tu dominio y casos de uso permanecen desacoplados del SDK y solo cambias infraestructura.
