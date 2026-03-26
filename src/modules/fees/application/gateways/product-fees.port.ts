/** =============================================================
 * ANCHOR: port-product-fees
 * Puerto (interface) para Product Fees API (getMyFeesEstimateForASIN)
 * Define el contrato para estimar comisiones de Amazon sobre un ASIN.
 * ============================================================= */
export interface ProductFeesPort {
  /**
   * Obtiene la estimación de fees de Amazon para un ASIN dado.
   * 
   * @param params - Parámetros para la estimación de fees
   * @param params.asin - ASIN del producto
   * @param params.marketplaceId - ID del marketplace de Amazon
   * @param params.listingPriceAmount - Precio de venta del producto
   * @param params.listingPriceCurrency - Moneda del precio de venta
   * @param params.shippingAmount - Costo de envío (opcional)
   * @param params.shippingCurrency - Moneda del envío (opcional)
   * @param params.isAmazonFulfilled - Indica si es FBA (opcional, default false)
   * @returns Respuesta raw de SP-API con la estimación de fees
   */
  getMyFeesEstimateForASIN(params: {
    asin: string;
    marketplaceId: string;
    listingPriceAmount: number;
    listingPriceCurrency: string;
    shippingAmount?: number;
    shippingCurrency?: string;
    isAmazonFulfilled?: boolean;
  }): Promise<any>;
}

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Esta interface define el contrato (puerto) para la comunicación con Product Fees API,
 * desacoplando el dominio de la infraestructura según el patrón Hexagonal Architecture.
 * 
 * BENEFICIOS:
 * 1. Inversión de dependencias: El dominio define el contrato, la infraestructura lo implementa
 * 2. Testabilidad: Permite mockear la implementación en tests unitarios
 * 3. Flexibilidad: Facilita cambiar el proveedor (SP-API → otro servicio) sin afectar el dominio
 * 4. Desacoplamiento: La lógica de negocio no depende de detalles de implementación
 * 
 * CÓMO EXTENDER:
 * - Agregar nuevos métodos: Define nuevas operaciones de Product Fees API (ej. getMyFeesEstimateForSKU)
 * - Nuevos parámetros: Actualiza la firma del método existente para soportar más opciones
 * - Tipos específicos: Reemplaza `any` por interfaces DTO cuando se consolide la estructura
 * 
 * CÓMO MODIFICAR:
 * - Si SP-API cambia parámetros requeridos, actualiza la firma del método
 * - Si necesitas validaciones adicionales, considera crear un DTO específico para params
 * - Para operaciones batch, agrega método `getMyFeesEstimateForMultipleASINs`
 * - Si necesitas contexto adicional (ej. sellerId), añádelo a los params
 * 
 * IMPLEMENTACIONES:
 * - SpapiProductFeesGateway: Implementación usando amazon-sp-api
 * - MockProductFeesGateway: Implementación mock para testing
 * - CachedProductFeesGateway: Implementación con caché (decorator pattern)
 * 
 * NOTAS:
 * - El tipo de retorno es `any` para flexibilidad, será transformado por el Mapper
 * - Los parámetros opcionales (shipping*, isAmazonFulfilled) tienen defaults en el DTO
 * - La validación de parámetros se hace en el DTO, no en el puerto
 * ============================================================= */
