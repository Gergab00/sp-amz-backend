import { Injectable } from '@nestjs/common';
import { UpdateListingItemUseCase } from '../use-cases/update-listing-item.use-case';
import { UpdateListingItemDto } from '../../interface/http/dto/update-listing-item.request-dto.interface';
import { PatchListingItemUseCase } from '../use-cases/patch-listing-item.use-case';
import { PatchListingItemDto } from '../../interface/http/dto/patch-listing-item.request-dto.interface';

@Injectable()
export class ListingService {
  constructor(
    private readonly updateListingItemUseCase: UpdateListingItemUseCase,
    private readonly patchListingItemUseCase: PatchListingItemUseCase,
  ) {}

  /**
   * Actualiza un ítem en el listado usando la SP-API Listings Items.
   *
   * @param dto DTO con los parámetros necesarios para la operación.
   * @returns Respuesta de la SP-API.
   */
  async updateListingItem(dto: UpdateListingItemDto): Promise<any> {
    return this.updateListingItemUseCase.execute(dto);
  }

  /**
   * Modifica un listing existente usando la SP-API Listings Items.
   *
   * @param dto DTO con los parámetros necesarios para la operación.
   * @returns Respuesta de la SP-API.
   */
  async patchListingItem(dto: PatchListingItemDto): Promise<any> {
    return this.patchListingItemUseCase.execute(dto);
  }
}
