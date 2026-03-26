import { ApiProperty } from '@nestjs/swagger';
import type { Currency } from '../../../../shared/infrastructure/http/spapi/spapi.config';

/** =============================================================
 * ANCHOR: fees-estimate-response-dto
 * DTOs para normalizar la respuesta de estimación de fees.
 * ============================================================= */

/** Detalle individual de un fee */
export class FeeDetail {
  @ApiProperty({ 
    example: 'ReferralFee',
    description: 'Tipo de fee (ReferralFee, PerItemFee, FBAFees, etc.)'
  })
  feeType!: string;

  @ApiProperty({ 
    example: 45.00,
    description: 'Monto del fee'
  })
  feeAmount!: number;

  @ApiProperty({ 
    example: 'MXN',
    description: 'Moneda del fee'
  })
  currency!: Currency;

  @ApiProperty({ 
    example: false,
    nullable: true,
    description: 'Indica si el fee está incluido en el total (opcional)'
  })
  includedFeeDetail?: boolean;
}

/** Respuesta normalizada de estimación de fees para un ASIN */
export class FeesEstimateResponseDto {
  @ApiProperty({ 
    example: 'MXN',
    description: 'Moneda de la estimación'
  })
  currency!: Currency;

  @ApiProperty({ 
    example: 75.50,
    description: 'Total estimado de fees de Amazon'
  })
  totalFeesEstimate!: number;

  @ApiProperty({ 
    type: [FeeDetail],
    description: 'Desglose detallado de cada fee',
    example: [
      { feeType: 'ReferralFee', feeAmount: 45.00, currency: 'MXN' },
      { feeType: 'VariableClosingFee', feeAmount: 30.50, currency: 'MXN' }
    ]
  })
  feeBreakdown!: FeeDetail[];

  @ApiProperty({ 
    nullable: true,
    description: 'Respuesta raw de SP-API (opcional, para debugging)',
    example: { 
      FeesEstimateResult: { 
        Status: 'Success', 
        FeesEstimate: { 
          TotalFeesEstimate: { CurrencyCode: 'MXN', Amount: 75.50 }
        } 
      } 
    }
  })
  raw?: any;
}

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Estos DTOs cumplen con Clean Architecture al:
 * 1. Separar el contrato de salida de la lógica de negocio y la respuesta externa
 * 2. Normalizar la estructura de respuesta SP-API a un formato interno consistente
 * 3. Documentar con Swagger (@ApiProperty) para generar API docs automáticas
 * 4. Proporcionar ejemplos claros para facilitar el consumo del API
 * 5. Incluir campo "raw" opcional para debugging sin exponer detalles en producción
 * 
 * CÓMO EXTENDER:
 * - Agregar nuevos campos de fees: añade propiedades a FeeDetail o FeesEstimateResponseDto
 * - Nuevos metadatos: agrega propiedades con decoradores @ApiProperty apropiados
 * - Campos calculados: añade propiedades derivadas (ej. netProfit = listingPrice - totalFees)
 * - Información de contexto: agrega asin, marketplaceId, timestamp para auditoría
 * 
 * CÓMO MODIFICAR:
 * - Si SP-API cambia estructura de respuesta, actualiza el mapper (no este DTO)
 * - Si necesitas ocultar "raw" en producción, usa @Exclude() + class-transformer
 * - Para agregar validaciones de salida, usa decoradores de class-validator
 * - Para renombrar campos, actualiza nombres de propiedades y ejemplos Swagger
 * 
 * NOTA:
 * Este DTO es principalmente para documentación y tipado. La transformación
 * de datos SP-API a este formato se hace en el Mapper (Fase 4), aplicando
 * el patrón Anti-Corruption Layer para desacoplar el dominio de la API externa.
 * ============================================================= */
