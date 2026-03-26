import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { GetFeesEstimateAsinDto } from '../dto/get-fees-estimate-asin.dto';
import { FeesEstimateResponseDto } from '../dto/fees-estimate-response.dto';
import { FeesMapper } from '../../infrastructure/mappers/fees.mapper.infrastructure';
import type { ProductFeesPort } from '../gateways/product-fees.port';
import { MARKETPLACE_CURRENCY_MAP } from '../../../../shared/infrastructure/http/spapi/spapi.config';

/** =============================================================
 * ANCHOR: usecase-get-fees-estimate-asin
 * Caso de uso para estimar fees de Amazon sobre un ASIN.
 * Orquesta validaciones de negocio, llamada al gateway y transformación.
 * ============================================================= */
@Injectable()
export class GetFeesEstimateForAsinUseCase {
  private readonly logger = new Logger(GetFeesEstimateForAsinUseCase.name);

  constructor(
    @Inject('ProductFeesPort')
    private readonly productFeesGateway: ProductFeesPort,
  ) {}

  /**
   * Ejecuta el caso de uso para estimar fees de Amazon.
   * 
   * Flujo:
   * 1. Validar reglas de negocio (moneda ↔ marketplace, shipping currency)
   * 2. Llamar al gateway para obtener estimación de SP-API
   * 3. Transformar respuesta con mapper (anti-corruption layer)
   * 4. Validar que la respuesta sea válida
   * 5. Retornar DTO normalizado
   * 
   * @param dto - Parámetros validados de entrada
   * @returns DTO con estimación de fees normalizada
   * @throws BadRequestException - Si las validaciones de negocio fallan
   * @throws NotFoundException - Si no se puede obtener estimación para el ASIN
   */
  async execute(dto: GetFeesEstimateAsinDto): Promise<FeesEstimateResponseDto> {
    // ANCHOR: validate-business-rules
    // Validar reglas de negocio antes de llamar al gateway
    this.validateBusinessRules(dto);

    try {
      // ANCHOR: call-gateway
      // Llamar al gateway para obtener estimación de SP-API
      this.logger.debug(
        `Ejecutando caso de uso para ASIN: ${dto.asin}, marketplace: ${dto.marketplaceId}`,
      );

      const spapiResponse = await this.productFeesGateway.getMyFeesEstimateForASIN({
        asin: dto.asin,
        marketplaceId: dto.marketplaceId,
        listingPriceAmount: dto.listingPriceAmount,
        listingPriceCurrency: dto.listingPriceCurrency,
        shippingAmount: dto.shippingAmount,
        shippingCurrency: dto.shippingCurrency,
        isAmazonFulfilled: dto.isAmazonFulfilled,
      });

      // ANCHOR: transform-response
      // Transformar respuesta usando mapper (anti-corruption layer)
      const feesEstimate = FeesMapper.mapAsinEstimate(spapiResponse);

      // ANCHOR: validate-response
      // Validar que la respuesta sea válida
      if (!feesEstimate) {
        // Intentar extraer mensaje de error de la respuesta
        const errorMessage = FeesMapper.extractErrorMessage(spapiResponse);
        
        this.logger.warn(
          `No se pudo obtener estimación de fees para ASIN ${dto.asin}: ${errorMessage || 'Respuesta inválida'}`,
        );

        throw new NotFoundException(
          errorMessage || 
          `No se pudo obtener estimación de fees para el ASIN ${dto.asin} en el marketplace especificado. Verifica que el ASIN sea válido y esté disponible en este marketplace.`,
        );
      }

      this.logger.debug(
        `Estimación de fees obtenida exitosamente para ASIN ${dto.asin}: ${feesEstimate.totalFeesEstimate} ${feesEstimate.currency}`,
      );

      return feesEstimate;
    } catch (error) {
      // ANCHOR: error-handling
      // Propagar errores del gateway (ya son HttpException)
      // Si no es HttpException, wrapped en error genérico
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Error al obtener estimación de fees para ASIN ${dto.asin}: ${error?.message || error}`,
        error?.stack,
      );

      // Re-lanzar error original si es HttpException del gateway
      throw error;
    }
  }

  /**
   * Valida reglas de negocio antes de llamar al gateway.
   * 
   * Reglas:
   * - La moneda debe coincidir con el marketplace (opcional, warning)
   * - Si se proporciona shippingCurrency, debe coincidir con listingPriceCurrency
   * 
   * @param dto - DTO con parámetros de entrada
   * @throws BadRequestException - Si las validaciones fallan
   */
  private validateBusinessRules(dto: GetFeesEstimateAsinDto): void {
    // ANCHOR: validate-currency-marketplace
    // Validar que la moneda coincida con el marketplace (warning, no blocking)
    const expectedCurrency = MARKETPLACE_CURRENCY_MAP[dto.marketplaceId];
    
    if (expectedCurrency && dto.listingPriceCurrency !== expectedCurrency) {
      this.logger.warn(
        `La moneda ${dto.listingPriceCurrency} no coincide con la moneda esperada para el marketplace ${dto.marketplaceId} (${expectedCurrency}). Esto puede causar errores en SP-API.`,
      );
      
      // Opcional: Lanzar error si quieres hacer esta validación estricta
      // throw new BadRequestException(
      //   `La moneda ${dto.listingPriceCurrency} no es válida para el marketplace ${dto.marketplaceId}. Use ${expectedCurrency}.`,
      // );
    }

    // ANCHOR: validate-shipping-currency
    // Validar que la moneda de shipping coincida con la de listing (si se proporciona)
    if (dto.shippingCurrency && dto.shippingCurrency !== dto.listingPriceCurrency) {
      throw new BadRequestException(
        `La moneda de envío (${dto.shippingCurrency}) debe coincidir con la moneda del precio de listado (${dto.listingPriceCurrency}).`,
      );
    }

    // ANCHOR: validate-price-positive
    // Validar que los precios sean positivos (ya validado en DTO, pero double-check)
    if (dto.listingPriceAmount <= 0) {
      throw new BadRequestException(
        'El precio de listado debe ser mayor a 0.',
      );
    }

    if (dto.shippingAmount !== undefined && dto.shippingAmount < 0) {
      throw new BadRequestException(
        'El costo de envío no puede ser negativo.',
      );
    }
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este caso de uso cumple con Clean Architecture al:
 * 
 * 1. ORQUESTACIÓN DE LÓGICA DE NEGOCIO:
 *    - Coordina validaciones, llamada al gateway y transformación
 *    - Aplica reglas de negocio específicas del dominio
 *    - Mantiene el flujo de ejecución claro y secuencial
 *    - Separa responsabilidades: validación → gateway → mapper → respuesta
 * 
 * 2. INVERSIÓN DE DEPENDENCIAS:
 *    - Depende de ProductFeesPort (abstracción), no de implementación
 *    - El gateway se inyecta vía DI usando token 'ProductFeesPort'
 *    - Permite cambiar implementación sin modificar el use case
 *    - Facilita testing con mocks del puerto
 * 
 * 3. SINGLE RESPONSIBILITY:
 *    - Solo orquesta el flujo de estimación de fees
 *    - NO maneja HTTP (responsabilidad del controller)
 *    - NO transforma datos (responsabilidad del mapper)
 *    - NO valida entrada (responsabilidad del DTO)
 *    - NO comunica con SP-API (responsabilidad del gateway)
 * 
 * 4. VALIDACIONES DE NEGOCIO:
 *    - Valida moneda ↔ marketplace (warning, configurable)
 *    - Valida shipping currency = listing currency (strict)
 *    - Valida precios positivos (defensa en profundidad)
 *    - Logging de warnings para debugging
 * 
 * 5. MANEJO DE ERRORES:
 *    - Propaga HttpException del gateway sin modificar
 *    - Lanza NotFoundException si mapper retorna null
 *    - Lanza BadRequestException para validaciones de negocio
 *    - Logging de errores con contexto y stack trace
 * 
 * 6. OBSERVABILIDAD:
 *    - Logger de NestJS para tracking de ejecución
 *    - DEBUG: Inicio de ejecución, éxito de operación
 *    - WARN: Validaciones no críticas (moneda mismatch)
 *    - ERROR: Fallos con stack trace y contexto
 * 
 * CÓMO EXTENDER:
 * - Nuevas validaciones: Agrega métodos privados en validateBusinessRules
 * - Reglas adicionales: Crea métodos validate* específicos
 * - Cálculos derivados: Agrega lógica después de mapper (ej. netProfit)
 * - Persistencia: Inyecta repository y guarda snapshot de estimación
 * - Notificaciones: Inyecta event bus y emite eventos de negocio
 * - Caché: Verifica caché antes de llamar gateway
 * - Retry: Implementa retry logic con backoff para errores transitorios
 * 
 * CÓMO MODIFICAR:
 * - Para cambiar validaciones: Actualiza validateBusinessRules
 * - Si cambian reglas de negocio: Ajusta las validaciones y lógica
 * - Para agregar logs: Usa this.logger en puntos críticos
 * - Si necesitas transacciones: Inyecta TransactionManager
 * - Para cambiar manejo de errores: Actualiza try-catch y throws
 * 
 * TESTING:
 * - Mockea ProductFeesPort para aislar lógica del gateway
 * - Valida cada regla de negocio con casos específicos
 * - Prueba manejo de errores del gateway (403, 422, 429)
 * - Verifica transformación correcta con mapper
 * - Confirma logging apropiado en cada escenario
 * - Tests de validaciones: moneda mismatch, shipping currency diferente
 * - Tests de errores: mapper retorna null, gateway falla
 * 
 * NOTAS IMPORTANTES:
 * - El use case NO modifica el DTO de entrada
 * - Las validaciones del DTO (class-validator) ya se ejecutaron antes
 * - El mapper retorna null si hay problemas, no lanza excepción
 * - Los errores HTTP del gateway se propagan directamente
 * - La validación de moneda es WARNING, no blocking (configurable)
 * - ANCHOR comments facilitan navegación del flujo
 * ============================================================= */
