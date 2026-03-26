// RUTA: /src/features/listing/domain/mappers/patch-listing.mapper.ts

import { PatchListingItemDto } from '../../interface/http/dto/patch-listing-item.request-dto.interface';

/**
 * Mapper para transformar un DTO en el cuerpo esperado por la SP-API para la operación patchListingsItem.
 */
export class PatchListingMapper {
  static toSpapiBody(dto: PatchListingItemDto): { productType: string; patches: Array<{ op: string; path: string; value: any }> } {
    const patches: Array<{ op: string; path: string; value: any }> = [];

    if (dto.price !== undefined) {
      patches.push({
        op: 'replace',
        path: '/attributes/purchasable_offer',
        value: [
          {
            our_price: [{ schedule: [{ value_with_tax: dto.price }] }],
          },
        ],
      });
    }

    if (dto.quantity !== undefined) {
      patches.push({
        op: 'replace',
        path: '/attributes/fulfillment_availability',
        value: [
          {
            fulfillment_channel_code: "DEFAULT",
            quantity: dto.quantity,
          },
        ],
      });
    }

    return { productType: "TOY_FIGURE", patches: patches };
  }
}