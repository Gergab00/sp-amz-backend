import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { GetItemOffersDto } from '../dto/get-item-offers.dto';
import { ItemOffersMapper } from '../../infrastructure/mappers/item-offers.mapper.infrastructure';

@Injectable()
export class GetItemOffersUseCase {
  constructor(private readonly spapiClient: SpapiClient) {}

  async execute(dto: GetItemOffersDto): Promise<any> {
    const { asin, marketplaceId, itemCondition = 'New' } = dto;

    const response = await this.spapiClient.callAPI({
      endpoint: 'productPricing',
      operation: 'getItemOffers',
      path: { Asin: asin },
      query: {
        MarketplaceId: marketplaceId,
        ItemCondition: itemCondition,
      },
      options: { version: '2022-05-01' },
    });

    console.log('SP-API Response:', response.Offers);

    return ItemOffersMapper.toDomain(response);
  }
}