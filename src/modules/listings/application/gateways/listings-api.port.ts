/** =============================================================
 * ANCHOR: port-listings-api
 * Puerto (interface) para Listings Items (getListingsItem)
 * ============================================================= */
export interface ListingsApiPort {
  getListingsItem(params: {
    sellerId: string;
    sku: string;
    marketplaceId: string;
  }): Promise<any>;
}

/** =============================================================
 * ARQUITECTURA LIMPIA: Esta interface define el contrato para la comunicación
 * con Listings Items API, desacoplando el dominio de la infraestructura.
 * Extender: agrega nuevos métodos para otras operaciones de Listings.
 * Modificar: ajusta la firma para soportar nuevos parámetros o tipos de respuesta.
 * ============================================================= */
