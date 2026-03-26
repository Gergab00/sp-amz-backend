// RUTA: /src/features/listing/domain/mappers/listing.mapper.ts

import { UpdateListingItemDto } from '../../interface/http/dto/update-listing-item.request-dto.interface';

/**
 * Mapper para transformar un DTO en el cuerpo esperado por la SP-API.
 */
export class ListingMapper {
  static toSpapiBody(dto: UpdateListingItemDto): any {
    return {
      productType: dto.productType,
      requirements: 'LISTING_OFFER_ONLY',
      attributes: {
        condition_type: [
          {
            value: 'new_new',
            marketplace_id: dto.marketplaceId,
          },
        ],
        merchant_suggested_asin: [
          {
            value: dto.asin,
            marketplace_id: dto.marketplaceId,
          },
        ],
        fulfillment_availability: [
          {
            fulfillment_channel_code: 'DEFAULT',
            quantity: dto.quantity,
          },
        ],
        purchasable_offer: [
          {
            currency: 'MXN',
            our_price: [
              {
                schedule: [
                  {
                    value_with_tax: dto.price,
                  },
                ],
              },
            ],
            marketplace_id: dto.marketplaceId,
          },
        ],
      },
    };
  }
}