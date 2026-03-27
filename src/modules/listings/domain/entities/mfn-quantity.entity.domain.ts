/** =============================================================
 * ANCHOR: entity-mfn-quantity
 * Entidad rica para representar la cantidad MFN de un SKU en un marketplace.
 * Incluye validaciones de negocio y comportamiento.
 * ============================================================= */
export class MfnQuantity {
  private constructor(
    public readonly sku: string,
    public readonly marketplaceId: string,
    private _quantity: number,
    public readonly fulfillmentChannel: string,
    public readonly raw?: any, // Datos crudos opcionales de SP-API
  ) {
    this.validate();
  }

  /**
   * Factory method para crear una instancia de MfnQuantity con validaciones
   */
  static create(
    sku: string,
    marketplaceId: string,
    quantity: number,
    fulfillmentChannel: string,
    raw?: any,
  ): MfnQuantity {
    return new MfnQuantity(
      sku,
      marketplaceId,
      quantity,
      fulfillmentChannel,
      raw,
    );
  }

  /**
   * Getter para cantidad disponible
   */
  get quantity(): number {
    return this._quantity;
  }

  /**
   * Validaciones de invariantes de dominio
   */
  private validate(): void {
    if (!this.sku || this.sku.trim() === '') {
      throw new Error('SKU cannot be empty');
    }

    if (!this.marketplaceId || this.marketplaceId.trim() === '') {
      throw new Error('Marketplace ID cannot be empty');
    }

    if (this._quantity < 0) {
      throw new Error('Available quantity cannot be negative');
    }

    const validChannels = ['DEFAULT', 'MFN', 'AFN', 'Amazon_NA'];
    if (
      !this.fulfillmentChannel ||
      !validChannels.includes(this.fulfillmentChannel)
    ) {
      throw new Error(
        `Invalid fulfillment channel: ${this.fulfillmentChannel}. Valid channels: ${validChannels.join(', ')}`,
      );
    }
  }

  /**
   * Verifica si hay cantidad disponible para vender
   */
  isAvailable(): boolean {
    return this._quantity > 0;
  }

  /**
   * Verifica si se puede cumplir una orden con la cantidad solicitada
   */
  canFulfillOrder(requestedQuantity: number): boolean {
    if (requestedQuantity <= 0) {
      throw new Error('Requested quantity must be positive');
    }
    return this._quantity >= requestedQuantity;
  }

  /**
   * Reduce la cantidad disponible (ej: después de una venta)
   */
  reduceQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity to reduce must be positive');
    }
    if (!this.canFulfillOrder(quantity)) {
      throw new Error(
        `Insufficient quantity available. Available: ${this._quantity}, Requested: ${quantity}`,
      );
    }
    this._quantity -= quantity;
  }

  /**
   * Incrementa la cantidad disponible (ej: después de restock)
   */
  increaseQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity to increase must be positive');
    }
    this._quantity += quantity;
  }

  /**
   * Verifica si la cantidad está por debajo de un umbral crítico
   */
  isBelowThreshold(threshold: number): boolean {
    if (threshold < 0) {
      throw new Error('Threshold cannot be negative');
    }
    return this._quantity < threshold;
  }

  /**
   * Obtiene el nivel de stock (low, medium, high)
   */
  getStockLevel(
    lowThreshold = 10,
    highThreshold = 50,
  ): 'out-of-stock' | 'low' | 'medium' | 'high' {
    if (this._quantity === 0) return 'out-of-stock';
    if (this._quantity < lowThreshold) return 'low';
    if (this._quantity < highThreshold) return 'medium';
    return 'high';
  }

  /**
   * Compara si esta cantidad es suficiente comparada con otra entidad MfnQuantity
   */
  hasMoreQuantityThan(other: MfnQuantity): boolean {
    return this._quantity > other._quantity;
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA - ENTIDAD RICA:
 * Esta entidad encapsula el modelo de negocio MFN con:
 * - Validaciones de invariantes en el constructor
 * - Comportamiento de negocio (isAvailable, canFulfillOrder, etc.)
 * - Encapsulación de datos (quantity privado con getter)
 * - Factory method para creación controlada
 *
 * Cumple con arquitectura hexagonal:
 * - No depende de infraestructura (sin imports de BD, HTTP, etc.)
 * - Contiene lógica de dominio pura
 * - Es testeable sin dependencias externas
 * ============================================================= */
