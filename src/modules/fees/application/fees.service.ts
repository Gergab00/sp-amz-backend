import { Injectable } from '@nestjs/common';
import { GetFeesEstimateAsinDto } from './dto/get-fees-estimate-asin.dto';
import { FeesEstimateResponseDto } from './dto/fees-estimate-response.dto';
import { GetFeesEstimateForAsinUseCase } from './use-cases/get-fees-estimate-asin.usecase';

/** =============================================================
 * ANCHOR: service-fees
 * Servicio del dominio Fees: Orquesta los casos de uso relacionados
 * con estimaciones de comisiones de Amazon SP-API.
 * ============================================================= */

/**
 * Servicio del dominio Fees
 *
 * Responsabilidades:
 * - Exponer m├®todos p├║blicos para ser llamados desde los controllers
 * - Delegar toda la l├│gica de negocio a los casos de uso correspondientes
 * - Mantener el controller delgado siguiendo el principio de Single Responsibility
 * - Facilitar la extensi├│n del dominio agregando nuevos m├®todos que deleguen a nuevos use cases
 *
 * Clean Architecture:
 * - Esta capa de servicio act├║a como punto de entrada al dominio desde la infraestructura
 * - NO contiene l├│gica de negocio (eso est├í en los use cases)
 * - NO maneja HTTP directamente (eso es responsabilidad del controller)
 * - Solo orquesta y delega a los casos de uso
 */
@Injectable()
export class FeesService {
  /**
   * Constructor del servicio
   * @param getFeesEstimateForAsinUseCase - Caso de uso para estimar fees por ASIN
   */
  constructor(
    private readonly getFeesEstimateForAsinUseCase: GetFeesEstimateForAsinUseCase,
  ) {}

  /** =============================================================
   * ANCHOR: estimate-by-asin
   * Estima las comisiones de Amazon para un ASIN dado un precio objetivo
   * ============================================================= */

  /**
   * Estima las comisiones de Amazon para un ASIN espec├¡fico
   *
   * Este m├®todo delega directamente al caso de uso correspondiente,
   * manteniendo la responsabilidad ├║nica del servicio como orquestador.
   *
   * @param dto - DTO con los par├ímetros necesarios para la estimaci├│n:
   *              - asin: Identificador del producto
   *              - marketplaceId: Marketplace objetivo
   *              - listingPriceAmount: Precio de venta propuesto
   *              - listingPriceCurrency: Moneda del precio
   *              - shippingAmount (opcional): Costo de env├¡o
   *              - shippingCurrency (opcional): Moneda del env├¡o
   *              - isAmazonFulfilled (opcional): Si es FBA o FBM
   * @returns Promise con la estimaci├│n de fees transformada y validada
   * @throws BadRequestException - Si las validaciones de negocio fallan
   * @throws NotFoundException - Si no se encuentra informaci├│n de fees
   * @throws HttpException - Si hay errores en la comunicaci├│n con SP-API
   *
   * @example
   * ```typescript
   * const estimate = await feesService.estimateByAsin({
   *   asin: 'B08N5WRWNW',
   *   marketplaceId: 'A1AM78C64UM0Y8',
   *   listingPriceAmount: 499.99,
   *   listingPriceCurrency: 'MXN',
   *   isAmazonFulfilled: false
   * });
   * ```
   */
  async estimateByAsin(
    dto: GetFeesEstimateAsinDto,
  ): Promise<FeesEstimateResponseDto> {
    return this.getFeesEstimateForAsinUseCase.execute(dto);
  }

  /** =============================================================
   * ANCHOR: extensibility-points
   * Puntos de extensi├│n para nuevos casos de uso:
   *
   * 1. Estimaci├│n por SKU:
   *    - Inyectar GetFeesEstimateForSkuUseCase
   *    - Agregar m├®todo estimateBySku(dto) que delegue al use case
   *
   * 2. Estimaci├│n batch (m├║ltiples ASINs):
   *    - Inyectar GetBatchFeesEstimateUseCase
   *    - Agregar m├®todo estimateBatch(dto) que delegue al use case
   *
   * 3. Historial de estimaciones:
   *    - Inyectar GetFeesHistoryUseCase
   *    - Agregar m├®todo getHistory(filters) que delegue al use case
   *
   * 4. Persistencia de snapshots:
   *    - Inyectar SaveFeesEstimateUseCase
   *    - Agregar m├®todo saveSnapshot(estimate) que delegue al use case
   *
   * Ejemplo de extensi├│n:
   * ```typescript
   * constructor(
   *   private readonly getFeesEstimateForAsinUseCase: GetFeesEstimateForAsinUseCase,
   *   private readonly getFeesEstimateForSkuUseCase: GetFeesEstimateForSkuUseCase, // NUEVO
   * ) {}
   *
   * async estimateBySku(dto: GetFeesEstimateSkuDto): Promise<FeesEstimateResponseDto> {
   *   return this.getFeesEstimateForSkuUseCase.execute(dto);
   * }
   * ```
   * ============================================================= */
}

/** =============================================================
 * ARQUITECTURA LIMPIA: ┬┐Por qu├® este servicio cumple con Clean Architecture?
 *
 * 1. **Single Responsibility Principle (SRP)**:
 *    - Su ├║nica responsabilidad es orquestar y delegar a los casos de uso
 *    - NO contiene l├│gica de negocio (esa est├í en el use case)
 *    - NO maneja validaciones HTTP (esas est├ín en los DTOs y ValidationPipe)
 *    - NO transforma datos (eso lo hace el mapper)
 *    - NO se comunica con APIs externas (eso lo hace el gateway)
 *
 * 2. **Dependency Inversion Principle (DIP)**:
 *    - Depende de abstracciones (el use case) no de implementaciones concretas
 *    - Los casos de uso se inyectan v├¡a constructor (Dependency Injection)
 *    - Facilita testing al poder reemplazar use cases con mocks
 *
 * 3. **Open/Closed Principle (OCP)**:
 *    - Abierto para extensi├│n: Se pueden agregar nuevos m├®todos sin modificar los existentes
 *    - Cerrado para modificaci├│n: Los m├®todos existentes no necesitan cambiar al agregar nuevos
 *
 * 4. **Separaci├│n de Capas**:
 *    - Act├║a como puente entre la capa de infraestructura (controller) y la capa de aplicaci├│n (use cases)
 *    - Mantiene el controller delgado delegando toda la l├│gica
 *    - Permite que el dominio sea independiente del framework (NestJS)
 *
 * ============================================================= */

/** =============================================================
 * C├ôMO EXTENDER ESTE SERVICIO:
 *
 * 1. **Agregar nuevo caso de uso**:
 *    ```typescript
 *    constructor(
 *      private readonly getFeesEstimateForAsinUseCase: GetFeesEstimateForAsinUseCase,
 *      private readonly nuevoUseCase: NuevoUseCase, // Inyectar aqu├¡
 *    ) {}
 *
 *    async nuevoMetodo(dto: NuevoDto) {
 *      return this.nuevoUseCase.execute(dto);
 *    }
 *    ```
 *
 * 2. **Agregar l├│gica de orquestaci├│n compleja** (solo si es necesario):
 *    - Si necesitas combinar m├║ltiples use cases en un solo flujo
 *    - Mant├®n la l├│gica de negocio en los use cases
 *    - El servicio solo debe orquestar las llamadas
 *    ```typescript
 *    async estimateAndSave(dto: GetFeesEstimateAsinDto) {
 *      const estimate = await this.getFeesEstimateForAsinUseCase.execute(dto);
 *      await this.saveEstimateUseCase.execute(estimate);
 *      return estimate;
 *    }
 *    ```
 *
 * 3. **Agregar m├®todos de conveniencia**:
 *    - M├®todos que simplifican llamadas comunes
 *    - Siempre delegando a los use cases
 *    ```typescript
 *    async estimateForMexicanMarket(asin: string, price: number) {
 *      return this.estimateByAsin({
 *        asin,
 *        marketplaceId: 'A1AM78C64UM0Y8',
 *        listingPriceAmount: price,
 *        listingPriceCurrency: 'MXN',
 *        isAmazonFulfilled: false,
 *      });
 *    }
 *    ```
 * ============================================================= */

/** =============================================================
 * C├ôMO MODIFICAR ESTE SERVICIO:
 *
 * 1. **Si cambia la firma del use case**:
 *    - Actualizar la llamada en el m├®todo correspondiente
 *    - Ejemplo: Si el use case ahora requiere contexto adicional
 *    ```typescript
 *    async estimateByAsin(dto: GetFeesEstimateAsinDto, userId: string) {
 *      return this.getFeesEstimateForAsinUseCase.execute(dto, userId);
 *    }
 *    ```
 *
 * 2. **Si necesitas agregar logging o m├®tricas**:
 *    - Usar decoradores o interceptors de NestJS (preferido)
 *    - O agregar logging m├¡nimo sin afectar la l├│gica
 *    ```typescript
 *    async estimateByAsin(dto: GetFeesEstimateAsinDto) {
 *      this.logger.log(`Estimando fees para ASIN: ${dto.asin}`);
 *      return this.getFeesEstimateForAsinUseCase.execute(dto);
 *    }
 *    ```
 *
 * 3. **Si necesitas agregar cach├®**:
 *    - Usar decoradores de NestJS (@CacheKey, @CacheTTL)
 *    - O implementar en un interceptor separado
 *    - NO implementar l├│gica de cach├® directamente en el servicio
 *
 * 4. **Si necesitas agregar autorizaci├│n**:
 *    - Usar guards de NestJS en el controller
 *    - NO implementar l├│gica de autorizaci├│n en el servicio
 *    - El servicio debe permanecer agn├│stico del contexto HTTP
 * ============================================================= */

/** =============================================================
 * TESTING:
 *
 * Para testear este servicio:
 *
 * ```typescript
 * describe('FeesService', () => {
 *   let service: FeesService;
 *   let useCase: GetFeesEstimateForAsinUseCase;
 *
 *   beforeEach(async () => {
 *     const module = await Test.createTestingModule({
 *       providers: [
 *         FeesService,
 *         {
 *           provide: GetFeesEstimateForAsinUseCase,
 *           useValue: { execute: jest.fn() }, // Mock del use case
 *         },
 *       ],
 *     }).compile();
 *
 *     service = module.get<FeesService>(FeesService);
 *     useCase = module.get<GetFeesEstimateForAsinUseCase>(GetFeesEstimateForAsinUseCase);
 *   });
 *
 *   it('should delegate to use case', async () => {
 *     const dto = { ... };
 *     const expected = { ... };
 *     jest.spyOn(useCase, 'execute').mockResolvedValue(expected);
 *
 *     const result = await service.estimateByAsin(dto);
 *
 *     expect(useCase.execute).toHaveBeenCalledWith(dto);
 *     expect(result).toEqual(expected);
 *   });
 * });
 * ```
 * ============================================================= */
