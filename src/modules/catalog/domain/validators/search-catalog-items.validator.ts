import { SearchCatalogItemsDto } from '../../application/dto/search-catalog-items.dto';

export class SearchCatalogItemsValidator {
  static validate(dto: SearchCatalogItemsDto): void {
    this.validateSearchCriteria(dto);
    this.validateSellerIdForSku(dto);
  }

  private static validateSearchCriteria(dto: SearchCatalogItemsDto): void {
    const hasIdentifiers =
      dto.identifiersType && dto.identifiers && dto.identifiers.length > 0;
    const hasKeywords = dto.keywords && dto.keywords.length > 0;

    if (!hasIdentifiers && !hasKeywords) {
      throw new Error(
        'Debe proporcionar "identifiers" con "identifiersType" o "keywords" para realizar la búsqueda.',
      );
    }

    if (hasIdentifiers && hasKeywords) {
      throw new Error(
        'No se pueden usar "identifiers" y "keywords" simultáneamente. Elija uno u otro.',
      );
    }
  }

  private static validateSellerIdForSku(dto: SearchCatalogItemsDto): void {
    if (dto.identifiersType === 'SKU' && !dto.sellerId) {
      throw new Error(
        'El parámetro "sellerId" es obligatorio cuando "identifiersType" es "SKU".',
      );
    }
  }
}
