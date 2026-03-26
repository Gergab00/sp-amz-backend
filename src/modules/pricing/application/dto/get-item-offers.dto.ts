import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ItemCondition } from '../../domain/types/item-condition.type';

export class GetItemOffersDto {
  @ApiProperty({ description: 'ASIN del producto', example: 'B09NWCSC8F' })
  @IsString()
  asin: string;

  @ApiProperty({ description: 'Lista de IDs de marketplace', example: ['ATVPDKIKX0DER'] })
  @IsArray()
  @IsString({ each: true })
  marketplaceId: string[];

  @ApiProperty({ description: 'Condición del ítem', example: 'New', required: false })
  @IsOptional()
  @IsString()
  itemCondition?: ItemCondition;
}