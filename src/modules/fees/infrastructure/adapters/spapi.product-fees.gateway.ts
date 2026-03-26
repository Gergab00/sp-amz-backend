import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ProductFeesPort } from '../../application/gateways/product-fees.port';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';

/** =============================================================
 * ANCHOR: gateway-spapi-product-fees
 * Implementación del puerto ProductFeesPort usando amazon-sp-api.
 * Gestiona la comunicación con Product Fees API v0 de Amazon.
 * ============================================================= */
@Injectable()
export class SpapiProductFeesGateway implements ProductFeesPort {
  private readonly logger = new Logger(SpapiProductFeesGateway.name);

  constructor(private readonly spapiClient: SpapiClient) {}

  /**
   * Obtiene la estimación de fees de Amazon para un ASIN.
   * Implementa manejo robusto de errores y logging para observabilidad.
   */
  async getMyFeesEstimateForASIN(params: {
    asin: string;
    marketplaceId: string;
    listingPriceAmount: number;
    listingPriceCurrency: string;
    shippingAmount?: number;
    shippingCurrency?: string;
    isAmazonFulfilled?: boolean;
  }): Promise<any> {
    try {
      // ANCHOR: logging-request
      // Log de request para debugging y observabilidad
      this.logger.debug(
        `Llamando a SP-API getMyFeesEstimateForASIN: ${JSON.stringify({
          asin: params.asin,
          marketplaceId: params.marketplaceId,
          listingPrice: `${params.listingPriceAmount} ${params.listingPriceCurrency}`,
          isAmazonFulfilled: params.isAmazonFulfilled ?? false,
        })}`,
      );

      // ANCHOR: build-request-body
      // Construcción del cuerpo de la solicitud según especificación de SP-API
      const feesEstimateRequest = {
        IdType: 'ASIN',
        IdValue: params.asin,
        IsAmazonFulfilled: params.isAmazonFulfilled ?? false,
        MarketplaceId: params.marketplaceId,
        Identifier: params.asin,
        PriceToEstimateFees: {
          ListingPrice: {
            CurrencyCode: params.listingPriceCurrency,
            Amount: params.listingPriceAmount,
          },
          // Shipping es opcional, solo incluirlo si se proporciona
          ...(params.shippingAmount !== undefined && {
            Shipping: {
              CurrencyCode: params.shippingCurrency || params.listingPriceCurrency,
              Amount: params.shippingAmount,
            },
          }),
        },
      };

      // ANCHOR: sp-api-call
      // Llamada a SP-API usando el cliente centralizado
      const response = await this.spapiClient.callAPI({
        endpoint: 'productFees',
        operation: 'getMyFeesEstimateForASIN',
        path: { Asin: params.asin },
        body: {
          FeesEstimateRequest: feesEstimateRequest,
        },
      });

      // ANCHOR: logging-response
      // Log de respuesta exitosa (sin exponer datos sensibles)
      this.logger.debug(
        `Respuesta exitosa de getMyFeesEstimateForASIN para ASIN: ${params.asin}`,
      );
      this.logger.debug(`Respuesta de SP-API en getMyFeesEstimateForASIN: ${JSON.stringify(response)}`);

      return response;
    } catch (error: any) {
      // ANCHOR: error-handling
      // Manejo detallado de errores con logging y propagación apropiada
      this.logger.error(
        `Error en getMyFeesEstimateForASIN para ASIN ${params.asin}: ${error?.message || error}`,
        error?.stack,
      );

      // Manejo específico por código de error HTTP
      if (error?.code === 403 || error?.response?.status === 403) {
        // Error de permisos: la app no tiene acceso a Product Fees API
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Acceso denegado a Product Fees API. Verifica los permisos de tu aplicación en Seller Central.',
            error: 'Forbidden',
            details: error?.message,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (error?.code === 422 || error?.response?.status === 422) {
        // Error de validación: parámetros inválidos o ASIN no encontrado
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Parámetros inválidos o ASIN no encontrado en el marketplace especificado.',
            error: 'Unprocessable Entity',
            details: error?.message,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (error?.code === 429 || error?.response?.status === 429) {
        // Error de throttling: se excedió el rate limit
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Límite de solicitudes excedido. Intenta nuevamente en unos momentos.',
            error: 'Too Many Requests',
            details: error?.message,
            retryAfter: error?.response?.headers?.['retry-after'] || 60,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error?.code === 404 || error?.response?.status === 404) {
        // Error de recurso no encontrado
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'ASIN no encontrado o endpoint no disponible.',
            error: 'Not Found',
            details: error?.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Error genérico: propagar como Internal Server Error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al comunicarse con Amazon Product Fees API.',
          error: 'Internal Server Error',
          details: error?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este gateway cumple con Clean Architecture al:
 * 
 * 1. IMPLEMENTAR EL PUERTO (ProductFeesPort):
 *    - Desacopla el dominio de la infraestructura
 *    - Permite cambiar el proveedor sin afectar la lógica de negocio
 *    - Facilita testing mediante mocks/stubs
 * 
 * 2. INYECCIÓN DE DEPENDENCIAS:
 *    - SpapiClient se inyecta vía constructor (NestJS DI)
 *    - Permite reemplazar la implementación en tests
 *    - Sigue el principio de Inversión de Dependencias (SOLID)
 * 
 * 3. MANEJO ROBUSTO DE ERRORES:
 *    - Captura errores específicos (403, 422, 429, 404)
 *    - Transforma errores externos a excepciones HTTP estándar
 *    - Proporciona mensajes claros y contexto para debugging
 *    - Incluye detalles como retryAfter para throttling
 * 
 * 4. OBSERVABILIDAD:
 *    - Logger de NestJS para tracking de requests/responses
 *    - Logs en nivel DEBUG para operaciones normales
 *    - Logs en nivel ERROR con stack trace para fallos
 *    - No expone datos sensibles en logs
 * 
 * 5. CONSTRUCCIÓN DE REQUEST:
 *    - Transforma parámetros del dominio al formato SP-API
 *    - Maneja campos opcionales (shipping) correctamente
 *    - Aplica defaults apropiados (isAmazonFulfilled = false)
 * 
 * CÓMO EXTENDER:
 * - Agregar nuevos métodos: Implementa otras operaciones del puerto ProductFeesPort
 * - Retry automático: Usa decorador @Retry o librería como axios-retry para 429
 * - Caché: Implementa decorator pattern con CachedProductFeesGateway
 * - Circuit breaker: Integra patrón circuit breaker para resilencia
 * - Métricas: Agrega contador de llamadas exitosas/fallidas para monitoring
 * - Validación adicional: Valida parámetros antes de llamar a SP-API
 * 
 * CÓMO MODIFICAR:
 * - Si SP-API cambia estructura de request: Actualiza construcción en build-request-body
 * - Para nuevos códigos de error: Agrega casos en error-handling
 * - Si cambia el endpoint: Actualiza el valor en sp-api-call
 * - Para logs más detallados: Ajusta nivel de logging o agrega más contexto
 * - Si necesitas transformación de respuesta: Hazlo en el Mapper, no aquí
 * 
 * TESTING:
 * - Mockea SpapiClient para tests unitarios
 * - Verifica manejo de cada código de error (403, 422, 429, 404)
 * - Valida construcción correcta del request body
 * - Confirma que los logs se emiten apropiadamente
 * 
 * NOTAS IMPORTANTES:
 * - Este gateway NO transforma la respuesta, esa responsabilidad es del Mapper
 * - Los errores se propagan como HttpException para que NestJS los maneje
 * - El logging usa Logger de NestJS para consistencia con el framework
 * - La validación de parámetros ya se hizo en el DTO, aquí solo construimos el request
 * ============================================================= */
