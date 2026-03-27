import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

/** =============================================================
 * ANCHOR: dto-get-mfn-quantity
 * DTO para solicitar la cantidad MFN para un SKU/marketplace.
 * ============================================================= */
export class GetMfnQuantityDto {
  @ApiProperty({ example: 'A1UCRBGKQ8T9I5' })
  @IsString()
  @Length(5, 20)
  sellerId!: string;

  @ApiProperty({ example: 'B0DB3R4XSN' })
  @IsString()
  @Length(1, 40)
  sku!: string;

  @ApiProperty({ example: 'A1AM78C64UM0Y8', description: 'MX' })
  @IsString()
  @Length(10, 20)
  marketplaceId!: string;
}

/** =============================================================
 * ARQUITECTURA LIMPIA: Este DTO define el contrato de entrada, separando
 * validación y documentación del resto de la lógica. Extender: agrega nuevos
 * campos o validaciones según reglas de negocio. Modificar: ajusta decoradores
 * o ejemplos para reflejar cambios en el contrato.
 * ============================================================= */
