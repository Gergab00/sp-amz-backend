---
applyTo: '**/*.spec.ts'
---
# Convenciones de Testing — sp-amz-backend

## Alcance y herramientas

- **Framework:** Jest 30 + ts-jest.
- **Tests unitarios:** archivos `*.spec.ts` junto al archivo que prueban (misma carpeta).
- **Tests e2e:** `test/*.e2e-spec.ts` con config en `test/jest-e2e.json`.
- **Path alias disponible:** `@/` → `src/` (configurado en `jest > moduleNameMapper`).

## Estructura obligatoria de un spec

```ts
describe('<ClaseOFuncion>', () => {
  // arrange compartido
  beforeEach(() => { /* setup */ });

  it('debe <acción esperada> cuando <condición>', () => {
    // arrange → act → assert
  });
});
```

- Usar `describe` por clase o función pública bajo prueba.
- Usar `it` (no `test`) para cada caso.
- Frases en español: `'debe lanzar BadRequestException cuando ...'`.
- Un `it` por comportamiento; no combinar múltiples asserts de distintos escenarios en uno.

## Qué testear según capa

### `domain/entities/*.entity.domain.ts`
- Construcción válida e inválida de la entidad.
- Cada método de negocio: caso feliz + al menos un caso de borde/error.
- No mockear nada: el dominio es puro.

```ts
// Ejemplo: mfn-quantity.entity.domain.spec.ts
describe('MfnQuantityEntity', () => {
  it('debe construir con quantity válida', () => { ... });
  it('debe lanzar error si quantity es negativa', () => { ... });
});
```

### `application/use-cases/*.usecase.ts` / `*.use-case.ts`
- Mockear el puerto (interfaz) con `jest.fn()`.
- Verificar que el use-case llama el puerto con los argumentos correctos.
- Verificar respuesta ante caso feliz.
- Verificar que lanza la excepción correcta ante error del puerto.

```ts
// Patrón base (tomado de get-fees-estimate-asin.usecase.spec.ts)
describe('GetFeesEstimateAsinUseCase', () => {
  let useCase: GetFeesEstimateAsinUseCase;
  let portMock: jest.Mocked<ProductFeesPort>;

  beforeEach(() => {
    portMock = { getFeesEstimate: jest.fn() };
    useCase = new GetFeesEstimateAsinUseCase(portMock);
  });

  it('debe retornar el resultado del puerto', async () => {
    portMock.getFeesEstimate.mockResolvedValue({ totalFees: 10 });
    const result = await useCase.execute(dto);
    expect(result).toEqual({ totalFees: 10 });
  });
});
```

### `infrastructure/mappers/*.mapper.infrastructure.ts`
- Probar `toDto` / `toDomain` con payloads reales de SP-API (fixtures inline).
- Incluir caso con datos mínimos, datos completos y datos faltantes/null.
- No mockear nada: los mappers son funciones puras.

```ts
// Patrón base (tomado de fees.mapper.infrastructure.spec.ts)
describe('FeesMapper', () => {
  it('mapea respuesta completa de SP-API a DTO', () => {
    const raw = { FeesEstimateResult: { ... } };
    const result = FeesMapper.toDto(raw);
    expect(result.totalFees).toBe(10.5);
  });

  it('devuelve 0 si no hay fees en la respuesta', () => { ... });
});
```

### `shared/interface/http/guards/*.guard.ts`
- Crear un `ExecutionContext` mock con `jest.fn()` (ver `api-key.guard.spec.ts`).
- Cubrir: ruta pública por metadata, ruta pública por prefijo, falta API_KEY en entorno, key ausente, key incorrecta, key correcta.

## Mocks y helpers

- Preferir mocks manuales (`jest.fn()`, `jest.Mocked<T>`) sobre `jest.mock()` de módulos completos.
- Para `ExecutionContext` de NestJS, usar el patrón de `api-key.guard.spec.ts`:

```ts
function createExecutionContext(request: MockRequest): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  } as unknown as ExecutionContext;
}
```

## Cobertura mínima esperada

| Capa | Cobertura mínima |
|------|-----------------|
| `domain/entities` | 100 % de métodos de negocio |
| `application/use-cases` | caso feliz + error del puerto |
| `infrastructure/mappers` | payload completo + payload vacío/nulo |
| `shared/guards` | todos los branches de `canActivate` |

## Reglas de estilo

- No usar `console.log` en specs (en producción existe en use-cases, pero no en tests).
- Limpiar mocks en `afterEach` si se modifica estado compartido.
- Usar `expect.objectContaining(...)` cuando solo importan campos específicos de un objeto grande.
- No importar implementaciones concretas de infraestructura en specs de use-cases.
