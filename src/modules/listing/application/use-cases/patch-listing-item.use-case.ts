// RUTA: /src/features/listing/application/use-cases/patch-listing-item.use-case.ts

import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { ListingMapper } from '../../infrastructure/mappers/listing.mapper.infrastructure';
import { PatchListingMapper } from '../../infrastructure/mappers/patch-listing.mapper.infrastructure';
import { PatchListingItemDto } from '../../interface/http/dto/patch-listing-item.request-dto.interface';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Caso de uso para actualizar un listing existente.
 */
@Injectable()
export class PatchListingItemUseCase {
    constructor(private readonly spapiClient: SpapiClient) { }

    /**
     * Ejecuta la operación para actualizar un listing existente.
     *
     * @param dto DTO con los parámetros necesarios para la operación.
     * @returns Respuesta de la SP-API.
     */
    async execute(dto: PatchListingItemDto): Promise<any> {
        // Validar el DTO antes de continuar
        const dtoInstance = plainToInstance(PatchListingItemDto, dto);
        const errors = await validate(dtoInstance);
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
        }

        // ANCHOR: TRANSFORMACION_PRECIO
        // Aquí se debe invocar el servicio de transformación de precio
        // Ejemplo: const precioTransformado = await priceTransformerService.transform(dto.price, dto);
        // Luego usar precioTransformado en el body

        const body = PatchListingMapper.toSpapiBody(dto);

        const response = await this.spapiClient.callAPI({
            endpoint: 'listingsItems',
            operation: 'patchListingsItem',
            path: { sellerId: dto.sellerId, sku: dto.asin },
            query: { marketplaceIds: [dto.marketplaceId] },
            body,
        });

        console.log('Respuesta de SP-API patchListingsItem:', response);

        return response;
    }
}