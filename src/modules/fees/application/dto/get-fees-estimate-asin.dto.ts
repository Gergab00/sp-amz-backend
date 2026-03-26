import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, Length, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { VALID_CURRENCIES, MARKETPLACE_IDS } from '../../../../shared/infrastructure/http/spapi/spapi.config';
import type { Currency } from '../../../../shared/infrastructure/http/spapi/spapi.config';

/** =============================================================
 * ANCHOR: dto-get-fees-estimate-asin
 * DTO de entrada para estimar fees de Amazon por ASIN.
 * Valida parámetros requeridos y opcionales para la API Product Fees.
 * ============================================================= */
export class GetFeesEstimateAsinDto {
  /** ASIN del producto para el cual estimar fees */
  @ApiProperty({ 
    example: 'B0DB3R4XSN',
    description: 'Amazon Standard Identification Number del producto',
    minLength: 10,
    maxLength: 10
  })
  @IsString()
  @Length(10, 10, { message: 'ASIN debe tener exactamente 10 caracteres' })
  asin!: string;

  /** ID del marketplace de Amazon */
  @ApiProperty({ 
    example: MARKETPLACE_IDS.MX,
    description: 'ID del marketplace de Amazon (MX: A1AM78C64UM0Y8, US: ATVPDKIKX0DER, etc.)',
    minLength: 10,
    maxLength: 20
  })
  @IsString()
  @Length(10, 20, { message: 'marketplaceId debe tener entre 10 y 20 caracteres' })
  marketplaceId!: string;

  /** Monto del precio de listado (precio de venta) */
  @ApiProperty({ 
    example: 299.99,
    description: 'Precio de listado del producto (debe ser mayor a 0)',
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'listingPriceAmount debe ser un número con máximo 2 decimales' })
  @Min(0.01, { message: 'listingPriceAmount debe ser mayor a 0' })
  @Type(() => Number)
  listingPriceAmount!: number;

  /** Moneda del precio de listado */
  @ApiProperty({ 
    example: 'MXN',
    description: 'Código de moneda ISO 4217',
    enum: VALID_CURRENCIES
  })
  @IsString()
  @IsIn(VALID_CURRENCIES, { message: `listingPriceCurrency debe ser una de: ${VALID_CURRENCIES.join(', ')}` })
  listingPriceCurrency!: Currency;

  /** Monto del costo de envío (opcional, por defecto 0) */
  @ApiProperty({ 
    example: 50.00,
    description: 'Costo de envío (opcional, por defecto 0)',
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'shippingAmount debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'shippingAmount debe ser mayor o igual a 0' })
  @Type(() => Number)
  shippingAmount?: number;

  /** Moneda del costo de envío (opcional, debe coincidir con listingPriceCurrency si se proporciona) */
  @ApiProperty({ 
    example: 'MXN',
    description: 'Código de moneda ISO 4217 para el envío (debe coincidir con listingPriceCurrency)',
    required: false,
    enum: VALID_CURRENCIES
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_CURRENCIES, { message: `shippingCurrency debe ser una de: ${VALID_CURRENCIES.join(', ')}` })
  shippingCurrency?: Currency;

  /** Indica si el producto está cumplido por Amazon (FBA) */
  @ApiProperty({ 
    example: false,
    description: 'true si es FBA (Fulfillment by Amazon), false si es FBM/MFN',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'isAmazonFulfilled debe ser un booleano' })
  @Type(() => Boolean)
  isAmazonFulfilled?: boolean;
}

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este DTO cumple con Clean Architecture al:
 * 1. Separar el contrato de entrada de la lógica de negocio
 * 2. Usar validadores declarativos (class-validator) para reglas de entrada
 * 3. Documentar con Swagger (@ApiProperty) para generar API docs automáticas
 * 4. Importar constantes centralizadas (VALID_CURRENCIES, MARKETPLACE_IDS) 
 *    desde configuración, evitando duplicación y acoplamiento
 * 5. Aplicar transformaciones (@Type) para asegurar tipos correctos
 * 
 * CÓMO EXTENDER:
 * - Agregar nuevos campos: añade propiedades con decoradores apropiados
 * - Nuevas validaciones: usa decoradores de class-validator o crea custom validators
 * - Cambiar reglas: modifica decoradores existentes (ej. @Min, @Length)
 * - Agregar ejemplos Swagger: actualiza @ApiProperty con más ejemplos
 * 
 * CÓMO MODIFICAR:
 * - Si SP-API cambia parámetros requeridos, actualiza decoradores @IsOptional
 * - Si cambian restricciones (ej. min/max), ajusta @Min, @Max, @Length
 * - Si nuevas monedas o marketplaces, actualiza las constantes en spapi.config.ts
 * - Para reglas complejas (ej. validar que shippingCurrency === listingPriceCurrency),
 *   implementa un custom validator con @Validate()
 * ============================================================= */
