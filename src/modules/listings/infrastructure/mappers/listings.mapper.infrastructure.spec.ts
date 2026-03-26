import { ListingsMapper } from './listings.mapper';

describe('ListingsMapper.mapMfnQuantity', () => {
  const marketplaceId = 'A1AM78C64UM0Y8';

  it('extrae quantity cuando existe entrada DEFAULT', () => {
    const spItem = { attributes: { fulfillment_availability: [
      { marketplace_id: marketplaceId, fulfillment_channel_code: 'DEFAULT', quantity: 7 },
      { marketplace_id: marketplaceId, fulfillment_channel_code: 'AFN', quantity: 0 },
    ]}};
    const out = ListingsMapper.mapMfnQuantity(spItem, marketplaceId);
    expect(out.quantity).toBe(7);
    expect(out.fulfillmentChannel).toBe('DEFAULT');
  });

  it('devuelve null si no hay entrada DEFAULT/marketplace', () => {
    const spItem = { attributes: { fulfillment_availability: [
      { marketplace_id: 'OTRO', fulfillment_channel_code: 'DEFAULT', quantity: 5 },
    ]}};
    const out = ListingsMapper.mapMfnQuantity(spItem, marketplaceId);
    expect(out.quantity).toBeNull();
  });
});

/** =============================================================
 * ARQUITECTURA LIMPIA: Los tests validan la lógica anti-corrupción del mapper,
 * asegurando que la extracción de datos sea robusta y desacoplada de la fuente externa.
 * Extender: agrega nuevos casos para reglas adicionales o edge cases.
 * Modificar: ajusta los tests si cambian los requisitos del mapeo.
 * ============================================================= */
