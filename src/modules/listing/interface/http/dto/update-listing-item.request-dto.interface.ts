// RUTA: /src/features/listing/domain/dto/update-listing-item.dto.ts

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar un ítem en el listado.
 */
export class UpdateListingItemDto {
  @ApiProperty({ description: 'ID del vendedor', example: 'A1UCRBGKQ8T9I5' })
  @IsString({ message: 'El parámetro "sellerId" debe ser un string válido.' })
  @IsNotEmpty({ message: 'El parámetro "sellerId" es obligatorio.' })
  sellerId: string;

  @ApiProperty({ description: 'ASIN del producto', example: 'B09NWCSC8F' })
  @IsString({ message: 'El parámetro "asin" debe ser un string válido.' })
  @IsNotEmpty({ message: 'El parámetro "asin" es obligatorio.' })
  asin: string;

  @ApiProperty({ description: 'ID del marketplace', example: 'A1AM78C64UM0Y8' })
  @IsString({
    message: 'El parámetro "marketplaceId" debe ser un string válido.',
  })
  @IsNotEmpty({ message: 'El parámetro "marketplaceId" es obligatorio.' })
  marketplaceId: string;

  @ApiProperty({ description: 'Tipo de producto', example: 'TOY_FIGURE' })
  @IsString({
    message: 'El parámetro "productType" debe ser un string válido.',
  })
  @IsNotEmpty({ message: 'El parámetro "productType" es obligatorio.' })
  productType: string;

  @ApiProperty({ description: 'Precio del producto', example: 1049.99 })
  @IsNumber({}, { message: 'El parámetro "price" debe ser un número válido.' })
  @IsNotEmpty({ message: 'El parámetro "price" es obligatorio.' })
  price: number;

  @ApiProperty({ description: 'Cantidad disponible', example: 1 })
  @IsNumber(
    {},
    { message: 'El parámetro "quantity" debe ser un número válido.' },
  )
  @IsNotEmpty({ message: 'El parámetro "quantity" es obligatorio.' })
  quantity: number;
}
