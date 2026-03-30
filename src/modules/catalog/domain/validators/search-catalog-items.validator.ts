import { BadRequestException } from '@nestjs/common';
import { SearchCatalogItemsDto } from '../../application/dto/search-catalog-items.dto';

export class SearchCatalogItemsValidator {
  static validate(dto: SearchCatalogItemsDto): void {
    this.validateSearchCriteria(dto);
    this.validateSellerIdForSku(dto);
  }

  private static validateSearchCriteria(dto: SearchCatalogItemsDto): void {
    const identifiers = this.normalizeStringArray(dto.identifiers);
    const keywords = this.normalizeStringArray(dto.keywords);

    const hasIdentifiers = Boolean(
      dto.identifiersType && identifiers.length > 0,
    );
    const hasKeywords = keywords.length > 0;

    if (!hasIdentifiers && !hasKeywords) {
      throw new BadRequestException(
        'Debe proporcionar "identifiers" con "identifiersType" o "keywords" para realizar la búsqueda.',
      );
    }

    if (hasIdentifiers && hasKeywords) {
      throw new BadRequestException(
        'No se pueden usar "identifiers" y "keywords" simultáneamente. Elija uno u otro.',
      );
    }
  }

  private static validateSellerIdForSku(dto: SearchCatalogItemsDto): void {
    if (dto.identifiersType === 'SKU' && !dto.sellerId) {
      throw new BadRequestException(
        'El parámetro "sellerId" es obligatorio cuando "identifiersType" es "SKU".',
      );
    }
  }

  private static normalizeStringArray(value: unknown): string[] {
    if (value === undefined || value === null) {
      return [];
    }

    const values = Array.isArray(value) ? value : [value];

    return values
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
