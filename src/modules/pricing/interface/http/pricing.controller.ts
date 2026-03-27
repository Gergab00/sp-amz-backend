// RUTA: /src/modules/pricing/interface/http/pricing.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PricingService } from '../../application/services/pricing.service';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  /**
   * Obtiene las ofertas (Buy Box, FBA/MFN, precios, Prime) para un ASIN específico.
   *
   * @param asin Identificador ASIN del producto.
   * @param marketplaceId Marketplace ID (obligatorio).
   * @param itemCondition Condición del ítem (opcional).
   * @param customerType Tipo de cliente (opcional).
   * @returns Ofertas y precios para el ASIN en el marketplace indicado.
   */
  @Get('items/:asin/offers')
  @ApiParam({
    name: 'asin',
    type: String,
    required: true,
    example: 'B07N4M94TL',
    description: 'ASIN del producto',
  })
  @ApiOkResponse({
    description: 'Ofertas (Buy Box, FBA/MFN, precios, Prime) para un ASIN',
    schema: {
      example: {
        asin: 'B07N4M94TL',
        offers: [{ price: 19.99, condition: 'New', isPrime: true }],
      },
    },
  })
  @ApiQuery({
    name: 'marketplaceId',
    required: true,
    type: [String],
    isArray: true,
    example: ['A1AM78C64UM0Y8', 'ATVPDKIKX0DER'],
    description: 'IDs de marketplace (puede ser múltiple, ej: MX, US)',
  })
  @ApiQuery({
    name: 'itemCondition',
    required: false,
    type: String,
    enum: ['New', 'Used', 'Collectible', 'Refurbished', 'Club'],
    example: 'New',
    description: 'Condición del ítem',
  })
  getItemOffers(
    @Param('asin') asin: string,
    @Query('marketplaceId') marketplaceId: string[],
    @Query('itemCondition')
    itemCondition?: 'New' | 'Used' | 'Collectible' | 'Refurbished' | 'Club',
  ) {
    // INFO: marketplaceId ahora es array, se pasa directamente al servicio.
    return this.service.getItemOffers({ asin, marketplaceId, itemCondition });
  }
}
