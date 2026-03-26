import { Controller, Body, Post } from '@nestjs/common';
import { ListingService } from '../../application/services/listing.service';
import { UpdateListingItemDto } from './dto/update-listing-item.request-dto.interface';
import { PatchListingItemDto } from './dto/patch-listing-item.request-dto.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Listing') // Documenta el grupo de endpoints
@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  /**
   * Endpoint para actualizar un ítem en el listado.
   *
   * @param dto DTO con los parámetros necesarios para la operación.
   * @returns Respuesta de la SP-API.
   */
  @Post('update')
  @ApiOperation({ summary: 'Actualizar un ítem en el listado' }) // Describe el propósito del endpoint
  @ApiResponse({ status: 200, description: 'Ítem actualizado exitosamente.' }) // Respuesta exitosa
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' }) // Error de validación
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' }) // Error del servidor
  async updateListingItem(@Body() dto: UpdateListingItemDto): Promise<any> {
    return this.listingService.updateListingItem(dto);
  }

  /**
   * Endpoint para modificar parcialmente un ítem en el listado.
   *
   * @param dto DTO con los parámetros necesarios para la operación.
   * @returns Respuesta de la SP-API.
   */
  @Post('patch')
  @ApiOperation({ summary: 'Modificar parcialmente un ítem en el listado' })
  @ApiResponse({ status: 200, description: 'Ítem modificado exitosamente.' }) // Respuesta exitosa
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' }) // Error de validación
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' }) // Error del servidor
  async patchListingItem(@Body() dto: PatchListingItemDto): Promise<any> {
    return this.listingService.patchListingItem(dto);
  }
}
