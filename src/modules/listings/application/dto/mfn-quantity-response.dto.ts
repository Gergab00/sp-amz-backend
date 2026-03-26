import { ApiProperty } from '@nestjs/swagger';

/** =============================================================
 * ANCHOR: dto-mfn-quantity-response
 * DTO de respuesta para la consulta MFN quantity.
 * ============================================================= */
export class MfnQuantityResponseDto {
  @ApiProperty({ example: 'B0DB3R4XSN' })
  sku!: string;

  @ApiProperty({ example: 'A1AM78C64UM0Y8' })
  marketplaceId!: string;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: 1080.0 })
  amount!: number;

  @ApiProperty({ example: 'MXN' })
  currency!: string;

  @ApiProperty({ example: 'DEFAULT' })
  fulfillmentChannel!: string;

  @ApiProperty({ example: { raw: {} } })
  raw!: any;
}

/** =============================================================
 * ARQUITECTURA LIMPIA: Este DTO define el contrato de salida, desacoplando
 * la estructura de respuesta del modelo interno. Extender: agrega nuevos
 * campos según necesidades del frontend o negocio. Modificar: ajusta tipos
 * o ejemplos para reflejar cambios en la respuesta.
 * ============================================================= */
