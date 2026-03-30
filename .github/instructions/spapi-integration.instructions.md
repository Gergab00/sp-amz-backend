---
applyTo: 'src/modules/**/infrastructure/**,src/shared/infrastructure/**'
---
# Integración con SP-API — sp-amz-backend

## Cliente centralizado

**Toda llamada a SP-API pasa por `SpapiClient.callAPI()`** en:
`src/shared/infrastructure/http/spapi/spapi.client.ts`

Nunca crear instancias de `SellingPartner` directamente en adapters, use-cases o controllers.

## Firma de callAPI

```ts
type CallApiArgs = {
  endpoint: string;   // nombre del endpoint SP-API (ej. 'catalogItems')
  operation: string;  // operación dentro del endpoint (ej. 'searchCatalogItems')
  path?:  Record<string, unknown>;  // parámetros de ruta (:asin, :sku, etc.)
  query?: Record<string, unknown>;  // query params
  body?:  Record<string, unknown>;  // body para POST/PUT/PATCH
  options?: Record<string, unknown>;
};
```

## Versiones de endpoints

Las versiones se declaran en `spapi.config.ts` bajo `endpoints_versions` y se leen de variables de entorno:

| Variable de entorno | Endpoint | Default |
|---------------------|----------|---------|
| `SP_ENDPOINTS_VERSIONS__catalogItems` | `catalogItems` | `2020-12-01` |
| `SP_ENDPOINTS_VERSIONS__listingsItems` | `listingsItems` | `2021-08-01` |
| `SP_ENDPOINTS_VERSIONS__productFees` | `productFees` | `v0` |

Para un endpoint nuevo, declarar la versión en `spapiConfig()` y añadir la variable a `.env.example`.

## Patrón completo: puerto → gateway → mapper

### 1. Puerto (application/gateways/)

```ts
// <feature>-api.port.ts
export const FEATURE_API_PORT = Symbol('FeatureApiPort');

export interface FeatureApiPort {
  fetchData(input: FeatureInputDto): Promise<FeatureOutputDto>;
}
```

### 2. Gateway (infrastructure/adapters/)

```ts
// spapi.<feature>.gateway.ts
@Injectable()
export class SpapiFeatureGateway implements FeatureApiPort {
  constructor(private readonly spapi: SpapiClient) {}

  async fetchData(input: FeatureInputDto): Promise<FeatureOutputDto> {
    const raw = await this.spapi.callAPI({
      endpoint: 'spApiEndpointName',
      operation: 'spApiOperationName',
      query: {
        marketplaceIds: input.marketplaceId,
        // resto de parámetros
      },
    });
    return FeatureMapper.toDto(raw);
  }
}
```

### 3. Mapper (infrastructure/mappers/)

```ts
// <feature>.mapper.infrastructure.ts
export class FeatureMapper {
  static toDto(raw: Record<string, any>): FeatureOutputDto {
    return {
      // usar optional chaining para no explotar con respuestas parciales
      field: raw?.path?.field ?? defaultValue,
    };
  }
}
```

### 4. Registro en el módulo

```ts
// <feature>.module.ts
@Module({
  imports: [SpapiModule],
  providers: [
    { provide: FEATURE_API_PORT, useClass: SpapiFeatureGateway },
    FeatureUseCase,
    FeatureService,
  ],
  controllers: [FeatureController],
})
export class FeatureModule {}
```

## Constantes de marketplace y moneda

Usar las constantes ya definidas en `spapi.config.ts`:

```ts
import { MARKETPLACE_IDS, VALID_CURRENCIES, MARKETPLACE_CURRENCY_MAP }
  from 'src/shared/infrastructure/http/spapi/spapi.config';
```

No redefinir marketplace IDs ni listas de monedas en otros archivos.

## Manejo de errores en gateways

- El gateway deja que los errores de `SpapiClient` suban a la capa de use-case.
- El use-case puede capturarlos y relanzar excepciones de NestJS (`NotFoundException`, `BadRequestException`) si la semántica de negocio lo requiere.
- No usar `console.log` en gateways de producción; usar el `Logger` de NestJS si se necesita tracing.

```ts
// En use-case, si el gateway lanza error de "not found":
try {
  return await this.port.fetchData(input);
} catch (err) {
  throw new NotFoundException(`Recurso no encontrado: ${err.message}`);
}
```

## Marketplace IDs de referencia

```
MX  → A1AM78C64UM0Y8
US  → ATVPDKIKX0DER
CA  → A2EUQ1WTGCTBG2
BR  → A2Q3Y263D00KWC
```

## Agregar un endpoint SP-API nuevo — checklist

1. [ ] Verificar si el endpoint ya tiene versión en `spapi.config.ts`. Si no, añadirla.
2. [ ] Añadir la variable `SP_ENDPOINTS_VERSIONS__<endpoint>` a `.env.example`.
3. [ ] Crear el puerto en `application/gateways/<feature>-api.port.ts`.
4. [ ] Crear el gateway en `infrastructure/adapters/spapi.<feature>.gateway.ts`.
5. [ ] Crear el mapper con tests en `infrastructure/mappers/<feature>.mapper.infrastructure.ts`.
6. [ ] Registrar `{ provide: PORT_TOKEN, useClass: Gateway }` en el módulo.
7. [ ] Inyectar el puerto en el use-case con `@Inject(PORT_TOKEN)`.
8. [ ] Documentar el endpoint nuevo en `README.md`.
