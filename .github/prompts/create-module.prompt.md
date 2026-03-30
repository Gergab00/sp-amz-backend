---
mode: 'agent'
description: 'Crea un módulo de negocio completo siguiendo la arquitectura hexagonal del proyecto'
---

Crea un módulo de negocio completo en este proyecto NestJS/SP-API siguiendo la arquitectura hexagonal establecida.

## Nombre del módulo

${input:moduleName:Nombre del módulo en singular y minúsculas (ej. inventory, returns, reports)}

## Operaciones a implementar

${input:operations:Lista de operaciones separadas por coma (ej. getByAsin, searchBySku, createItem)}

## Endpoint SP-API a integrar

${input:spapiEndpoint:Nombre del endpoint SP-API (ej. catalogItems, listingsItems, productFees)}

## Ruta HTTP base

${input:httpPath:Ruta HTTP sin /api/ (ej. inventory/items)}

---

## Instrucciones para el agente

Crea todos los archivos necesarios para el módulo `${input:moduleName}` respetando **estrictamente** la siguiente estructura:

### 1. Puerto (`application/gateways/`)
- Archivo: `src/modules/${input:moduleName}/application/gateways/${input:moduleName}-api.port.ts`
- Exporta un `Symbol` como token de DI: `export const ${input:moduleName|upcase}_API_PORT = Symbol('...')`.
- Define la interfaz del puerto con los métodos necesarios para cada operación.
- Incluye `index.ts` que re-exporta el token y la interfaz.

### 2. Use-cases (`application/use-cases/`)
- Un archivo por operación: `<operation>-${input:moduleName}.usecase.ts`
- Inyectar el puerto con `@Inject(${input:moduleName|upcase}_API_PORT)`.
- NO importar `SpapiClient` directamente.
- Spec correspondiente para cada use-case: probar caso feliz + error del puerto.

### 3. Servicio de aplicación (`application/services/`)
- Archivo: `${input:moduleName}.service.ts`
- Fachada que delega a cada use-case.

### 4. DTOs de entrada (`application/dto/`)
- Un DTO por operación con `@ApiProperty`, `@IsString`, `@IsOptional`, etc.
- Importar constantes desde `src/shared/infrastructure/http/spapi/spapi.config.ts` si se usan marketplace IDs o monedas.

### 5. Mapper (`infrastructure/mappers/`)
- Archivo: `${input:moduleName}.mapper.infrastructure.ts`
- Método estático `toDto(raw: Record<string, any>): OutputDto` con optional chaining defensivo.
- Spec del mapper cubriendo payload completo y payload vacío/nulo.

### 6. Gateway (`infrastructure/adapters/`)
- Archivo: `spapi.${input:moduleName}.gateway.ts`
- Implementa el puerto. Inyecta `SpapiClient`.
- Llama `this.spapi.callAPI({ endpoint: '${input:spapiEndpoint}', operation: '...', ... })`.
- Delega el mapeo al mapper.

### 7. Controller (`interface/http/`)
- Archivo: `${input:moduleName}.controller.ts`
- Usa `@ApiTags`, `@ApiOperation`, `@ApiOkResponse`, `@ApiResponse(400)`.
- Sin lógica de negocio: delega al servicio.
- Rutas bajo prefijo `${input:httpPath}`.

### 8. Módulo NestJS
- Archivo: `src/modules/${input:moduleName}/${input:moduleName}.module.ts`
- `imports: [SpapiModule]`
- `providers: [{ provide: PORT_TOKEN, useClass: Gateway }, UseCase, Service]`
- `controllers: [Controller]`

### 9. Registro en AppModule
- Añadir `${input:moduleName|capitalize}Module` a los `imports` de `src/app.module.ts`.

### 10. README.md
- Añadir el módulo nuevo a "Endpoints Activos Hoy", "Endpoints De Negocio Expuestos" y "Estructura Del Proyecto".

## Verificación final

Después de crear todos los archivos, ejecuta mentalmente el flujo:
`Controller → Service → UseCase → Port → Gateway → SpapiClient → Mapper → DTO`

Confirma que:
- Ningún use-case importa `SpapiClient` directamente.
- El gateway implementa la interfaz del puerto.
- El módulo registra el token `provide/useClass`.
- Existen specs para: use-case(s) + mapper.
