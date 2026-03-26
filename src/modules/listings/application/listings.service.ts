import { Injectable } from '@nestjs/common';
import { GetMfnQuantityDto } from './dto/get-mfn-quantity.dto';
import { GetMfnQuantityUseCase } from './use-cases/get-mfn-quantity.usecase';

/** =============================================================
 * ANCHOR: service-listings
 * Servicio del dominio: delega en casos de uso.
 * ============================================================= */
@Injectable()
export class ListingsService {
  constructor(private readonly getMfnQty: GetMfnQuantityUseCase) {}

  /**
   * Obtiene la cantidad MFN para un SKU/marketplace.
   * @param dto DTO con par├ímetros de consulta
   * @returns Respuesta con cantidad MFN y metadatos
   */
  getMfnQuantity(dto: GetMfnQuantityDto) {
    return this.getMfnQty.execute(dto);
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA: El servicio orquesta los casos de uso, manteniendo
 * el controller delgado y facilitando la extensi├│n del dominio. Extender:
 * agrega nuevos m├®todos para otros casos de uso. Modificar: ajusta la
 * orquestaci├│n para soportar nuevos flujos o dependencias.
 * ============================================================= */
