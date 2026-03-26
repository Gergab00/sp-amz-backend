import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { GetMfnQuantityDto } from '../dto/get-mfn-quantity.dto';
import { ListingsMapper } from '../../infrastructure/mappers/listings.mapper.infrastructure';
import type { ListingsApiPort } from '../gateways/listings-api.port';
import { MfnQuantityResponseDto } from '../dto/mfn-quantity-response.dto';

/** =============================================================
 * ANCHOR: usecase-get-mfn-quantity
 * Reglas: obtener listing, extraer qty MFN y validar existencia.
 * ============================================================= */
@Injectable()
export class GetMfnQuantityUseCase {
  constructor(
    @Inject('ListingsApiPort') private readonly listingsApi: ListingsApiPort
  ) {}

  async execute(dto: GetMfnQuantityDto): Promise<MfnQuantityResponseDto> {
    const spItem = await this.listingsApi.getListingsItem({
      sellerId: dto.sellerId,
      sku: dto.sku,
      marketplaceId: dto.marketplaceId,
    });

    console.log(`Respuesta SP-API recibida: ${JSON.stringify(spItem)}`);

    const { quantity, fulfillmentChannel, amount, currency } = ListingsMapper.mapMfnQuantity(spItem, dto.marketplaceId);

    if (quantity === null || amount === null) {
      throw new NotFoundException('No hay fulfillment_availability u oferta para este SKU/marketplace (MFN).');
    }

    return {
      sku: dto.sku,
      marketplaceId: dto.marketplaceId,
      quantity,
      amount,
      currency: currency ?? '',
      fulfillmentChannel: fulfillmentChannel ?? '',
      raw: spItem,
    };
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA: Este caso de uso orquesta la lógica de negocio,
 * separando reglas, validaciones y dependencias externas. Extender: agrega
 * nuevas validaciones o reglas de negocio. Modificar: ajusta la orquestación
 * para soportar nuevos flujos o entidades.
 * ============================================================= */
