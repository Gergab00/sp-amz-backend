import { GetMfnQuantityUseCase } from './get-mfn-quantity.usecase';
import { ListingsApiPort } from '../gateways/listings-api.port';
import { ListingsMapper } from '../../infrastructure/mappers/listings.mapper.infrastructure';
import { GetMfnQuantityDto } from '../dto/get-mfn-quantity.dto';

/** =============================================================
 * ANCHOR: test-usecase-get-mfn-quantity
 * Tests unitarios para el caso de uso MFN quantity.
 * ============================================================= */
describe('GetMfnQuantityUseCase', () => {
  let useCase: GetMfnQuantityUseCase;
  let listingsApi: ListingsApiPort;

  beforeEach(() => {
    listingsApi = {
      getListingsItem: jest.fn(),
    };
    useCase = new GetMfnQuantityUseCase(listingsApi);
  });

  it('devuelve la cantidad MFN cuando existe', async () => {
    const dto: GetMfnQuantityDto = {
      sellerId: 'A2XXXXXXX',
      sku: 'SKU-001-MX',
      marketplaceId: 'A1AM78C64UM0Y8',
    };
    const spItem = { attributes: { fulfillment_availability: [
      { marketplace_id: dto.marketplaceId, fulfillment_channel_code: 'DEFAULT', quantity: 7 },
    ]}};
    (listingsApi.getListingsItem as jest.Mock).mockResolvedValue(spItem);
    const result = await useCase.execute(dto);
    expect(result.quantity).toBe(7);
    expect(result.fulfillmentChannel).toBe('DEFAULT');
  });

  it('lanza NotFoundException si no hay cantidad MFN', async () => {
    const dto: GetMfnQuantityDto = {
      sellerId: 'A2XXXXXXX',
      sku: 'SKU-001-MX',
      marketplaceId: 'A1AM78C64UM0Y8',
    };
    const spItem = { attributes: { fulfillment_availability: [] }};
    (listingsApi.getListingsItem as jest.Mock).mockResolvedValue(spItem);
    await expect(useCase.execute(dto)).rejects.toThrow('No hay fulfillment_availability para este SKU/marketplace (MFN).');
  });

  it('propaga errores del gateway', async () => {
    const dto: GetMfnQuantityDto = {
      sellerId: 'A2XXXXXXX',
      sku: 'SKU-001-MX',
      marketplaceId: 'A1AM78C64UM0Y8',
    };
    (listingsApi.getListingsItem as jest.Mock).mockRejectedValue(new Error('SP-API error'));
    await expect(useCase.execute(dto)).rejects.toThrow('SP-API error');
  });
});

/** =============================================================
 * ARQUITECTURA LIMPIA: Los tests validan la orquestación y reglas del caso de uso,
 * asegurando robustez y desacoplamiento. Extender: agrega nuevos casos para reglas
 * adicionales o edge cases. Modificar: ajusta los tests si cambian los requisitos.
 * ============================================================= */
