import { FeesEstimateResponseDto, FeeDetail } from '../../application/dto/fees-estimate-response.dto';
import type { Currency } from '../../../../shared/infrastructure/http/spapi/spapi.config';

/** =============================================================
 * ANCHOR: mapper-fees-anti-corruption
 * Mapper para transformar respuestas de Product Fees API (SP-API)
 * a la estructura interna del dominio. Implementa Anti-Corruption Layer.
 * ============================================================= */
export class FeesMapper {
  /**
   * Transforma la respuesta raw de getMyFeesEstimateForASIN a DTO interno.
   * 
   * Estructura esperada de SP-API (puede venir con o sin wrapper payload):
   * Opción 1 (con payload):
   * {
   *   payload: {
   *     FeesEstimateResult: { ... }
   *   }
   * }
   * 
   * Opción 2 (sin payload - amazon-sp-api devuelve directamente):
   * {
   *   FeesEstimateResult: {
   *     Status: 'Success' | 'ClientError' | 'ServerError',
   *     FeesEstimateIdentifier: { ... },
   *     FeesEstimate: {
   *       TimeOfFeesEstimation: string,
   *       TotalFeesEstimate: {
   *         CurrencyCode: string,
   *         Amount: number
   *       },
   *       FeeDetailList: [
   *         {
   *           FeeType: string,
   *           FeeAmount: { CurrencyCode: string, Amount: number },
   *           IncludedFeeDetailList?: [...]
   *         }
   *       ]
   *     },
   *     Error?: { ... }
   *   }
   * }
   * 
   * @param spapiResponse - Respuesta raw de SP-API
   * @returns DTO normalizado con fees estimate o null si no hay datos
   */
  static mapAsinEstimate(spapiResponse: any): FeesEstimateResponseDto | null {
    // ANCHOR: validate-response-structure
    // Validar que la respuesta tenga la estructura mínima esperada
    // Manejar ambos casos: con y sin wrapper payload
    const result = spapiResponse?.payload?.FeesEstimateResult || spapiResponse?.FeesEstimateResult;
    
    if (!result) {
      return null;
    }

    // ANCHOR: check-status
    // Validar que el status sea Success
    if (result.Status !== 'Success') {
      // Si hay error, retornar null (el gateway ya manejó errores HTTP)
      return null;
    }

    // ANCHOR: extract-fees-estimate
    // Extraer FeesEstimate de la respuesta
    const feesEstimate = result.FeesEstimate;
    if (!feesEstimate) {
      return null;
    }

    // ANCHOR: extract-total-fees
    // Extraer TotalFeesEstimate
    const totalFeesEstimate = feesEstimate.TotalFeesEstimate;
    if (!totalFeesEstimate || totalFeesEstimate.Amount === undefined) {
      return null;
    }

    const currency = totalFeesEstimate.CurrencyCode as Currency;
    const totalAmount = Number(totalFeesEstimate.Amount);

    // ANCHOR: extract-fee-details
    // Extraer y normalizar FeeDetailList
    const feeDetailList = Array.isArray(feesEstimate.FeeDetailList)
      ? feesEstimate.FeeDetailList
      : [];

    const feeBreakdown: FeeDetail[] = feeDetailList.map((fee: any) => ({
      feeType: fee.FeeType || 'Unknown',
      feeAmount: Number(fee.FeeAmount?.Amount || 0),
      currency: (fee.FeeAmount?.CurrencyCode || currency) as Currency,
      includedFeeDetail: fee.IncludedFeeDetailList ? true : undefined,
    }));

    // ANCHOR: build-response-dto
    // Construir DTO de respuesta normalizado
    const responseDto: FeesEstimateResponseDto = {
      currency,
      totalFeesEstimate: totalAmount,
      feeBreakdown,
      raw: spapiResponse, // Incluir respuesta raw para debugging
    };

    return responseDto;
  }

  /**
   * Extrae el mensaje de error de una respuesta fallida de SP-API.
   * Útil para logging y debugging cuando Status !== 'Success'.
   * 
   * @param spapiResponse - Respuesta raw de SP-API
   * @returns Mensaje de error o null
   */
  static extractErrorMessage(spapiResponse: any): string | null {
    // Manejar ambos casos: con y sin wrapper payload
    const result = spapiResponse?.payload?.FeesEstimateResult || spapiResponse?.FeesEstimateResult;
    
    if (!result || result.Status === 'Success') {
      return null;
    }

    // Extraer mensaje de error si existe
    const error = result.Error;
    if (error?.Message) {
      return error.Message;
    }

    return `Error: Status ${result.Status}`;
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este mapper cumple con Clean Architecture al:
 * 
 * 1. ANTI-CORRUPTION LAYER:
 *    - Desacopla el dominio de la estructura externa de SP-API
 *    - Transforma datos externos a modelos internos (DTOs)
 *    - Protege el dominio de cambios en la API externa
 *    - Normaliza nombres y estructura de datos
 * 
 * 2. SINGLE RESPONSIBILITY:
 *    - Solo se encarga de transformar datos (mapeo)
 *    - No maneja errores HTTP (responsabilidad del gateway)
 *    - No valida parámetros de entrada (responsabilidad del DTO)
 *    - No contiene lógica de negocio (responsabilidad del use case)
 * 
 * 3. ROBUSTEZ:
 *    - Maneja respuestas null/undefined con validaciones
 *    - Usa Array.isArray para evitar errores con datos inesperados
 *    - Convierte tipos (Number) para asegurar consistencia
 *    - Retorna null cuando no hay datos válidos
 * 
 * 4. TRAZABILIDAD:
 *    - Incluye campo 'raw' para debugging y auditoría
 *    - ANCHOR comments para navegación de código
 *    - JSDoc detallado con estructura esperada
 * 
 * CÓMO EXTENDER:
 * - Nuevos campos: Agrega propiedades al DTO y extrae del response
 * - Validaciones adicionales: Añade checks en las secciones ANCHOR
 * - Transformaciones complejas: Crea métodos auxiliares privados
 * - Otros endpoints: Agrega métodos static para otros mapeos (ej. mapSkuEstimate)
 * - Cálculos derivados: Agrega lógica para campos calculados (ej. netProfit)
 * 
 * CÓMO MODIFICAR:
 * - Si SP-API cambia estructura: Actualiza las validaciones y extracciones
 * - Para mejorar performance: Considera lazy loading del campo 'raw'
 * - Si necesitas logs: Inyecta Logger (pero prefiere mantener mappers puros)
 * - Para casos especiales: Agrega parámetros opcionales al método
 * 
 * TESTING:
 * - Happy path: Respuesta completa y válida de SP-API
 * - Status !== 'Success': Retorna null
 * - FeeDetailList vacío: Retorna feeBreakdown = []
 * - Campos null/undefined: Maneja gracefully
 * - Tipos incorrectos: Convierte a Number correctamente
 * - extractErrorMessage: Valida extracción de mensajes de error
 * 
 * NOTAS IMPORTANTES:
 * - Mapper es PURO: misma entrada → misma salida (sin side effects)
 * - NO lanza excepciones, retorna null si datos inválidos
 * - La validación de errores HTTP se hace en el gateway
 * - El campo 'raw' puede omitirse en producción usando @Exclude() de class-transformer
 * - Los ANCHOR comments facilitan navegación y refactoring
 * ============================================================= */
