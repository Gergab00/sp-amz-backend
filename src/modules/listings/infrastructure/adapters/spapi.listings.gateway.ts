import { Injectable, Logger } from '@nestjs/common';
import { ListingsApiPort } from '../../application/gateways/listings-api.port';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';

/** =============================================================
 * ANCHOR: gateway-spapi-listings
 * Implementación amazon-sp-api para getListingsItem
 * ============================================================= */
@Injectable()
export class SpapiListingsGateway implements ListingsApiPort {
  private readonly logger = new Logger(SpapiListingsGateway.name);

  constructor(private readonly spapiClient: SpapiClient) {}

  async getListingsItem(params: { sellerId: string; sku: string; marketplaceId: string; }) {
    try {
      this.logger.debug(`Llamando a SP-API getListingsItem: ${JSON.stringify(params)}`);
      return await this.spapiClient.callAPI({
        endpoint: 'listingsItems',
        operation: 'getListingsItem',
        path: { sellerId: params.sellerId, sku: params.sku },
        query: { marketplaceIds: [params.marketplaceId], includedData: ['fulfillmentAvailability', 'offers', 'attributes'] },
      });
    } catch (error: any) {
      this.logger.error(`Error en getListingsItem: ${error?.message || error}`);
      // Manejo básico de errores
      if (error?.code === 404) throw new Error('404: No encontrado en SP-API');
      if (error?.code === 403) throw new Error('403: Permiso denegado en SP-API');
      if (error?.code === 429) throw new Error('429: Throttling en SP-API');
      throw error;
    }
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA: Este gateway implementa el puerto ListingsApiPort,
 * desacoplando el dominio de la infraestructura y permitiendo cambiar la fuente
 * de datos sin afectar la lógica de negocio. Extender: agrega nuevos métodos o
 * mejora el manejo de errores/logs. Modificar: ajusta la integración con SP-API
 * o reemplaza por otro proveedor manteniendo el contrato.
 * ============================================================= */
