import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListingsService } from '../../application/listings.service';
import { GetMfnQuantityDto } from '../../application/dto/get-mfn-quantity.dto';
import { MfnQuantityResponseDto } from '../../application/dto/mfn-quantity-response.dto';

/** =============================================================
 * ANCHOR: controller-listings
 * Endpoint de consulta MFN (lectura de inventario del vendedor)
 * ============================================================= */
@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly service: ListingsService) {}

  @Get('mfn-quantity')
  @ApiOkResponse({
    description: 'Cantidad MFN para el SKU/marketplace especificado',
    type: MfnQuantityResponseDto,
  })
  getMfnQuantity(@Query() dto: GetMfnQuantityDto) {
    return this.service.getMfnQuantity(dto);
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA: El controller es delgado, delega toda la lógica
 * al servicio y casos de uso. Extender: agrega nuevos endpoints para
 * otras operaciones. Modificar: ajusta rutas o decoradores para nuevos
 * contratos o validaciones.
 * ============================================================= */
