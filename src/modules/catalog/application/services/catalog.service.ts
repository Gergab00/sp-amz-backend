// RUTA: /src/modules/catalog/application/services/catalog.service.ts
// ANCHOR: catalog-service
import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { GetCatalogItemDto } from '../dto/get-catalog-item.dto';
import { GetCatalogItemUseCase } from '../use-cases/get-catalog-item.use-case';
import { SearchCatalogItemsUseCase } from '../use-cases/search-catalog-items.use-case';
import { SearchCatalogItemsDto } from '../dto/search-catalog-items.dto';

@Injectable()
/**
 * CLASS: Servicio de catálogo
 *
 * Responsable de orquestar llamadas al cliente SP-API para obtener información
 * del catálogo (catalogItems). Esta clase actúa como una capa de dominio que
 * encapsula la interacción con `SpapiClient` para casos de uso relacionados
 * con items del catálogo.
 *
 * ANCHOR: servicio-catalogo
 */
export class CatalogService {
  // ANCHOR: constructor-servicio
  /**
   * Crea una instancia del servicio de catálogo.
   *
   * @param sp Instancia de `SpapiClient` utilizada para realizar llamadas HTTP
   *           a la Selling Partner API.
   * @param getCatalogItemUseCase Caso de uso para obtener ítems del catálogo.
   * @param searchCatalogItemsUseCase Caso de uso para buscar ítems en el catálogo.
   */
  constructor(
    private readonly sp: SpapiClient,
    private readonly getCatalogItemUseCase: GetCatalogItemUseCase,
    private readonly searchCatalogItemsUseCase: SearchCatalogItemsUseCase,
  ) {}

  // SECTION: operaciones-catalogo
  /**
   * Obtiene un item del catálogo usando `getCatalogItem` (versión 2020-12-01).
   *
   * Detalles:
   * - Si `dto.marketplaceIds` no está presente, se usa por defecto `ATVPDKIKX0DER` (US).
   * - Incluye campos útiles para smoke tests: `summaries`, `images`, `identifiers`.
   *
   * ANCHOR: metodo-getItem
   *
   * @param asin Identificador ASIN del producto a buscar.
   * @param dto DTO con parámetros opcionales (por ejemplo, `marketplaceIds`).
   * @returns Promesa con la respuesta de la SP-API (tipo `any` por compatibilidad).
   *
   * INFO: Se delega toda la comunicación HTTP a `SpapiClient.callAPI`, por lo que
   * la validación estricta de parámetros y manejo de errores debe considerarse
   * en capas superiores si se requiere comportamiento distinto.
   */
  async getCatalogItem(asin: string, dto: GetCatalogItemDto): Promise<any> {
    return this.getCatalogItemUseCase.execute(asin, dto);
  }

  /**
   * Busca items en el catálogo usando `searchCatalogItems` (versión 2020-12-01).
   *
   * Detalles:
   * - Permite buscar múltiples ítems basado en criterios como `keywords`, `category`, etc.
   * - Retorna un conjunto de ítems que coinciden con los criterios de búsqueda.
   *
   * ANCHOR: metodo-searchCatalogItems
   *
   * @param dto DTO con parámetros de búsqueda (por ejemplo, `keywords`, `category`).
   * @returns Promesa con la lista de ítems que coinciden con la búsqueda.
   *
   * INFO: La comunicación HTTP es manejada por `SpapiClient.callAPI`, y se espera
   * que los parámetros de búsqueda sean validados en el caso de uso correspondiente.
   */
  async searchCatalogItems(dto: SearchCatalogItemsDto): Promise<any> {
    return this.searchCatalogItemsUseCase.execute(dto);
  }
}
