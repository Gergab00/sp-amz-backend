import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// ANCHOR: search-catalog-items-dto
/**
 * DTO para la búsqueda de ítems en el catálogo de Amazon SP-API.
 *
 * Permite especificar múltiples criterios de búsqueda y opciones de paginación.
 * Incluye validaciones y transformaciones para asegurar el formato correcto de los datos recibidos.
 */
export class SearchCatalogItemsDto {
  /**
   * Lista de IDs de marketplace donde se realizará la búsqueda.
   * @example ['A1AM78C64UM0Y8']
   */
  @ApiProperty({
    description: 'Lista de IDs de marketplace',
    example: ['A1AM78C64UM0Y8'],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  marketplaceIds: string[];

  /**
   * Lista de identificadores de producto (ASIN, SKU, etc.).
   * @example ['B08XXXX', '750XXXX']
   */
  @ApiProperty({
    description: 'Lista de identificadores',
    example: ['B08XXXX', '750XXXX'],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  identifiers?: string[];

  /**
   * Tipo de identificador (ASIN, SKU, UPC, EAN, etc.).
   * @example 'ASIN'
   */
  @ApiProperty({
    description: 'Tipo de identificador',
    example: 'ASIN',
    required: false,
  })
  @IsOptional()
  @IsString()
  identifiersType?: string;

  /**
   * ID del vendedor (requerido si identifiersType = SKU).
   */
  @ApiProperty({
    description: 'ID del vendedor (requerido si identifiersType = SKU)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  /**
   * Palabras clave para búsqueda textual.
   * @example ['barbie', 'headbanz']
   */
  @ApiProperty({
    description: 'Palabras clave para búsqueda',
    example: ['barbie', 'headbanz'],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  /**
   * Lista de marcas a filtrar en la búsqueda.
   * @example ['mattel', 'spin master']
   */
  @ApiProperty({
    description: 'Lista de marcas',
    example: ['mattel', 'spin master'],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  brandNames?: string[];

  /**
   * Lista de categorías o clasificaciones a filtrar.
   * @example ['12345', '67890']
   */
  @ApiProperty({
    description: 'Lista de categorías',
    example: ['12345', '67890'],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  classificationIds?: string[];

  /**
   * Idioma de las palabras clave (por ejemplo, es_MX, en_US).
   * @example 'es_MX'
   */
  @ApiProperty({
    description: 'Idioma de las palabras clave',
    example: 'es_MX',
    required: false,
  })
  @IsOptional()
  @IsString()
  keywordsLocale?: string;

  /**
   * Conjuntos de datos a incluir en la respuesta. Por defecto: summaries.
   * Valores posibles: attributes, classifications, dimensions, identifiers, images, productTypes, relationships, salesRanks, summaries, vendorDetails.
   * @example ['attributes', 'classifications', 'dimensions', 'identifiers', 'summaries', 'images', 'productTypes', 'relationships', 'salesRanks']
   */
  @ApiProperty({
    description:
      'Conjuntos de datos a incluir en la respuesta. Por defecto: summaries',
    example: [
      'attributes',
      'classifications',
      'dimensions',
      'identifiers',
      'summaries',
      'images',
      'productTypes',
      'relationships',
      'salesRanks',
    ],
    required: false,
    enum: [
      'attributes',
      'classifications',
      'dimensions',
      'identifiers',
      'images',
      'productTypes',
      'relationships',
      'salesRanks',
      'summaries',
      'vendorDetails',
    ],
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  includedData?: string[];

  /**
   * Localización para los summaries devueltos por el endpoint.
   * @example 'es_MX'
   */
  @ApiProperty({
    description: 'Localización para los summaries',
    example: 'es_MX',
    required: false,
  })
  @IsOptional()
  @IsString()
  locale?: string;

  /**
   * Cantidad de resultados por página (paginación).
   * @example 10
   */
  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  /**
   * Token para paginación de resultados.
   * @example 'abc123'
   */
  @ApiProperty({
    description: 'Token para paginación',
    example: 'abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  pageToken?: string;
}
// ANCHOR: fin-search-catalog-items-dto
