/** =============================================================
 * ANCHOR: mapper-spapi-to-internal
 * Extrae cantidad MFN desde attributes.fulfillment_availability
 * para el marketplace/ canal DEFAULT. Devuelve null si no existe.
 * ============================================================= */
export class ListingsMapper {
  static mapMfnQuantity(spItem: any, marketplaceId: string) {
    // Adaptar a la estructura recibida en la respuesta SP-API
    // Ejemplo: { sku, offers: [{...}], fulfillmentAvailability: [{...}] }
    const fa = Array.isArray(spItem?.fulfillmentAvailability)
      ? spItem.fulfillmentAvailability
      : Array.isArray(spItem?.attributes?.fulfillment_availability)
        ? spItem.attributes.fulfillment_availability
        : [];
    const offer = Array.isArray(spItem?.offers)
      ? spItem.offers.find((x: any) => x.marketplaceId === marketplaceId)
      : null;
    const entry = fa.find(
      (x: any) =>
        (x?.fulfillmentChannelCode === 'DEFAULT' ||
          x?.fulfillment_channel_code === 'DEFAULT') &&
        (x?.marketplaceId === marketplaceId ||
          x?.marketplace_id === marketplaceId),
    );

    return {
      quantity: entry?.quantity ?? null,
      fulfillmentChannel:
        entry?.fulfillmentChannelCode ??
        entry?.fulfillment_channel_code ??
        null,
      amount: offer?.price?.amount ? Number(offer.price.amount) : null,
      currency: offer?.price?.currencyCode ?? null,
    } as {
      quantity: number | null;
      fulfillmentChannel: string | null;
      amount: number | null;
      currency: string | null;
    };
  }
}

/** =============================================================
 * ARQUITECTURA LIMPIA: Este mapper implementa la lógica anti-corrupción,
 * transformando datos externos (SP-API) a entidades internas.
 * Extender: agrega nuevos métodos para otros mapeos o ajusta la lógica de filtrado.
 * Modificar: actualiza la función para soportar nuevos atributos o reglas.
 * ============================================================= */
