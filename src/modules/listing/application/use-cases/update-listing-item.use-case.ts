// RUTA: /src/features/listing/application/use-cases/update-listing-item.use-case.ts

import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { UpdateListingItemDto } from '../../interface/http/dto/update-listing-item.request-dto.interface';
import { ListingMapper } from '../../infrastructure/mappers/listing.mapper.infrastructure';
import { validateSync } from 'class-validator';

/**
 * Caso de uso para actualizar un ítem en el listado.
 */
@Injectable()
export class UpdateListingItemUseCase {
  constructor(private readonly spapiClient: SpapiClient) {}

  /**
   * Ejecuta la operación para actualizar un ítem en el listado.
   *
   * @param dto DTO con los parámetros necesarios para la operación.
   * @returns Respuesta de la SP-API.
   * @throws Error si la validación del DTO falla.
   */
  async execute(dto: UpdateListingItemDto): Promise<any> {
    const errors = validateSync(dto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');
      throw new Error(`Validación fallida: ${errorMessages}`);
    }

    // ANCHOR: TRANSFORMACION_PRECIO
    // Aquí se debe invocar el servicio de transformación de precio
    // Ejemplo: const precioTransformado = await priceTransformerService.transform(dto.price, dto);
    // Luego usar precioTransformado en el body

    const body = ListingMapper.toSpapiBody(dto);

    return this.spapiClient.callAPI({
      endpoint: 'listingsItems',
      operation: 'putListingsItem',
      path: { sellerId: dto.sellerId, sku: dto.asin },
      query: { marketplaceIds: [dto.marketplaceId] },
      body,
    });
  }
}
