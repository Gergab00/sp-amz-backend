// RUTA: /src/features/listing/domain/dto/patch-listing-item.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * DTO para actualizar un listing existente.
 */
export class PatchListingItemDto {
  @ApiProperty({ description: 'ID del vendedor', example: 'A1UCRBGKQ8T9I5' })
  @IsString({ message: 'El parámetro "sellerId" debe ser un string válido.' })
  @IsNotEmpty({ message: 'El parámetro "sellerId" es obligatorio.' })
  sellerId: string;

  @ApiProperty({ description: 'SKU del producto', example: 'B09NWCSC8F' })
  @IsString({ message: 'El parámetro "sku" debe ser un string válido.' })
  @IsNotEmpty({ message: 'El parámetro "sku" es obligatorio.' })
  asin: string;

  @ApiProperty({ description: 'ID del marketplace', example: 'A1AM78C64UM0Y8' })
  @IsString({
    message: 'El parámetro "marketplaceId" debe ser un string válido.',
  })
  @IsNotEmpty({ message: 'El parámetro "marketplaceId" es obligatorio.' })
  marketplaceId: string;

  @ApiProperty({
    description: 'Precio del producto (opcional)',
    example: 1049.99,
  })
  @IsNumber({}, { message: 'El parámetro "price" debe ser un número válido.' })
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Cantidad disponible (opcional)', example: 1 })
  @IsNumber(
    {},
    { message: 'El parámetro "quantity" debe ser un número válido.' },
  )
  @IsOptional()
  quantity?: number;
}
