// RUTA: /src/features/catalog/application/dto/get-catalog-item.dto.ts
// ANCHOR: get-catalog-item-dto
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { toStringArray } from '@/shared/utils/transformers';

/**
 * DTO para la obtención de un ítem del catálogo de Amazon SP-API.
 *
 * Permite especificar los parámetros de consulta para el endpoint de catálogo.
 * Utiliza validaciones y transformaciones para asegurar el formato correcto de los datos recibidos.
 */
export class GetCatalogItemDto {
  /**
   * Lista de IDs de marketplace donde se buscará el ítem.
   *
   * @example ['A1AM78C64UM0Y8']
   */
  @ApiPropertyOptional({
    type: [String],
    example: ['A1AM78C64UM0Y8'],
    description: 'Marketplace IDs',
  })
  @IsArray()
  @Transform(({ value }) => toStringArray(value))
  @IsOptional()
  @IsString({ each: true })
  marketplaceIds?: string[];

  /**
   * Conjuntos de datos a incluir en la respuesta (por ejemplo: summaries, images, identifiers).
   * Si no se especifica, el valor por defecto es 'summaries'.
   *
   * @example ['summaries', 'images', 'identifiers']
   */
  @ApiPropertyOptional({
    type: [String],
    example: ['summaries', 'images', 'identifiers'],
    description: 'Conjuntos de datos a incluir en la respuesta',
  })
  @IsArray()
  @Transform(({ value }) => toStringArray(value))
  @IsOptional()
  @IsString({ each: true })
  includedData?: string[];

  /**
   * Localización para los summaries devueltos por el endpoint.
   *
   * @example 'es_MX'
   */
  @ApiPropertyOptional({
    type: String,
    example: 'es_MX',
    description: 'Localización para los summaries',
  })
  @IsOptional()
  @IsString()
  locale?: string;
}

// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
// ANCHOR: fin-get-catalog-item-dto
