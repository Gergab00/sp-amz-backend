export class ItemOffersMapper {
  static toDomain(response: any): any {
      return {
      asin: response.asin,
      offers: response.Offers.map((offer: any) => ({
        price: offer.ListingPrice?.Amount || 0,
        shippingCost: offer.Shipping?.Amount || 0,
        shippingTime: offer.ShippingTime || {},
        isPrime: offer.PrimeInformation?.IsPrime || false,
        isNationalPrime: offer.PrimeInformation?.IsNationalPrime || false,
        sellerId: offer.SellerId || 'Unknown',
        isFeaturedMerchant: offer.IsFeaturedMerchant || false,
        isBuyBoxWinner: offer.IsBuyBoxWinner || false,
        isFulfilledByAmazon: offer.IsFulfilledByAmazon || false
      })),
    };
  }
}

/**
 *     {
      Shipping: [Object],
      ListingPrice: [Object],
      ShippingTime: [Object],
      SellerFeedbackRating: [Object],
      PrimeInformation: [Object],
      SubCondition: 'new',
      SellerId: 'AJ99USE0OKOJ9',
      IsFeaturedMerchant: true,
      IsBuyBoxWinner: false,
      IsFulfilledByAmazon: true
    },
 */