// RUTA: /src/modules/catalog/interface/http/catalog.controller.ts
// ANCHOR: catalog-controller
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CatalogService } from '../../application/services/catalog.service';
import { GetCatalogItemDto } from '../../application/dto/get-catalog-item.dto';
import { SearchCatalogItemsDto } from '../../application/dto/search-catalog-items.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Get('items/search')
  @ApiOperation({ summary: 'Buscar ítems del catálogo de Amazon' })
  @ApiOkResponse({ description: 'Lista de ítems del catálogo (Amazon SP‑API)' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida o combinación de parámetros no permitida.' })
  @ApiQuery({ name: 'marketplaceIds', required: true, type: [String], description: 'Lista de IDs de marketplace' })
  @ApiQuery({ name: 'identifiers', required: false, type: [String], description: 'Lista de identificadores (ASIN, UPC, etc.)' })
  @ApiQuery({ name: 'identifiersType', required: false, type: String, description: 'Tipo de identificador (ASIN, EAN, GTIN, ISBN, JAN, MINSAN, SKU, UPC)' })
  @ApiQuery({ name: 'sellerId', required: false, type: String, description: 'ID del vendedor (requerido si identifiersType = SKU)' })
  @ApiQuery({ name: 'keywords', required: false, type: [String], description: 'Palabras clave para búsqueda' })
  @ApiQuery({ name: 'brandNames', required: false, type: [String], description: 'Lista de marcas' })
  @ApiQuery({ name: 'classificationIds', required: false, type: [String], description: 'Lista de categorías/browse-nodes' })
  @ApiQuery({ name: 'keywordsLocale', required: false, type: String, description: 'Idioma de las keywords' })
  @ApiQuery({ name: 'includedData', required: false, type: [String], description: 'Conjuntos de datos a incluir' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Localización para los summaries' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Cantidad de resultados por página' })
  @ApiQuery({ name: 'pageToken', required: false, type: String, description: 'Token para paginación' })
  async searchCatalogItems(@Query() dto: SearchCatalogItemsDto) {
    return this.service.searchCatalogItems(dto);
  }

  @Get('items/:asin')
  @ApiOperation({ summary: 'Obtener detalles de un ítem del catálogo' })
  @ApiOkResponse({ description: 'Detalle de catálogo (Amazon SP‑API)' })
  async getCatalogItem(
    @Param('asin') asin: string,
    @Query() dto: GetCatalogItemDto,
  ) {
    return this.service.getCatalogItem(asin, dto);
  }
}