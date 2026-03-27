import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { GetCatalogItemDto } from '../dto/get-catalog-item.dto';
import { CatalogItemMapper } from '../../infrastructure/mappers/catalog-item.mapper.infrastructure';
import { CatalogItemParamsAdapter } from '../../infrastructure/adapters/catalog-item-params.adapter';

// ANCHOR: get-catalog-item-use-case
/**
 * Caso de uso para obtener un ítem del catálogo de Amazon SP-API.
 *
 * Orquesta la construcción de parámetros, llamada al cliente SP-API y mapeo de la respuesta al dominio.
 */
@Injectable()
export class GetCatalogItemUseCase {
  /**
   * @param spapiClient Cliente de infraestructura para llamadas a Amazon SP-API
   */
  constructor(private readonly spapiClient: SpapiClient) {}

  /**
   * Ejecuta la consulta de un ítem del catálogo por ASIN y parámetros adicionales.
   *
   * @param asin Identificador ASIN del producto a consultar
   * @param dto DTO con parámetros opcionales de consulta
   * @returns Objeto de dominio mapeado desde la respuesta de Amazon SP-API
   */
  async execute(asin: string, dto: GetCatalogItemDto): Promise<any> {
    // SECTION: construcción de parámetros para el SDK
    const params = CatalogItemParamsAdapter.fromDto(dto, asin);
    // SECTION: llamada al cliente SP-API
    const response = await this.spapiClient.callAPI(params);
    // SECTION: mapeo de la respuesta al dominio
    return CatalogItemMapper.toDomain(response);
  }
}
// ANCHOR: fin-get-catalog-item-use-case
