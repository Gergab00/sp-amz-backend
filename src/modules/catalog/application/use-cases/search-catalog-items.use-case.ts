import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { SearchCatalogItemsDto } from '../dto/search-catalog-items.dto';
import { CatalogItemMapper } from '../../infrastructure/mappers/catalog-item.mapper.infrastructure';
import { SearchCatalogItemsValidator } from '../../domain/validators/search-catalog-items.validator';
import { SearchCatalogItemsParamsAdapter } from '../../infrastructure/adapters/search-catalog-items-params.adapter';
import { number } from 'joi';

// ANCHOR: search-catalog-items-use-case
/**
 * Caso de uso para la búsqueda de ítems en el catálogo de Amazon SP-API.
 *
 * Orquesta la validación, construcción de parámetros, llamada al cliente SP-API y mapeo de la respuesta al dominio.
 */
@Injectable()
export class SearchCatalogItemsUseCase {
  /**
   * @param spapiClient Cliente de infraestructura para llamadas a Amazon SP-API
   */
  constructor(private readonly spapiClient: SpapiClient) {}

  /**
   * Ejecuta la búsqueda de ítems en el catálogo según los criterios especificados en el DTO.
   *
   * @param dto DTO con los parámetros de búsqueda
   * @returns Objeto con los ítems mapeados al dominio y la paginación
   */
  async execute(dto: SearchCatalogItemsDto): Promise<any> {
    // SECTION: validación de parámetros de búsqueda
    SearchCatalogItemsValidator.validate(dto);
    // SECTION: construcción de parámetros para el SDK
    const params = SearchCatalogItemsParamsAdapter.fromDto(dto);
    // SECTION: llamada al cliente SP-API
    const response = await this.spapiClient.callAPI(params);

    console.log('SP-API Response:', response);

    // SECTION: mapeo de la respuesta al dominio y paginación
    return {
      items: response.items?.map(CatalogItemMapper.toDomain) || [],
      pagination: response.pagination,
      numberOfResults: response.numberOfResults,
    };
  }
}
// ANCHOR: fin-search-catalog-items-use-case
