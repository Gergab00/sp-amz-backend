---
mode: 'agent'
description: 'Integra un nuevo endpoint de SP-API en un módulo existente o nuevo, generando puerto, gateway y mapper'
---

Integra un nuevo endpoint de la Amazon Selling Partner API en este proyecto.

## Endpoint SP-API

${input:spapiEndpoint:Nombre del endpoint SP-API tal como lo requiere amazon-sp-api (ej. productPricing, catalogItems)}

## Operación SP-API

${input:spapiOperation:Nombre de la operación dentro del endpoint (ej. getCompetitivePricing, searchCatalogItems)}

## Versión del endpoint

${input:spapiVersion:Versión de la API (ej. 2022-05-01, v0, 2021-08-01)}

## Módulo de negocio

${input:moduleName:Módulo donde integrar (existente o nuevo)}

## Variable de entorno para la versión

${input:envVarVersion:Nombre de la variable de entorno (ej. SP_ENDPOINTS_VERSIONS__productPricing)}

---

## Instrucciones para el agente

### 1. Registrar la versión del endpoint

En `src/shared/infrastructure/http/spapi/spapi.config.ts`, dentro de `endpoints_versions`:
```ts
${input:spapiEndpoint}: process.env.${input:envVarVersion} || '${input:spapiVersion}',
```

En `.env.example`, añadir:
```
${input:envVarVersion}=${input:spapiVersion}
```

### 2. Puerto

En `src/modules/${input:moduleName}/application/gateways/${input:moduleName}-api.port.ts`:
- Añadir el método correspondiente a la nueva operación.
- Si el archivo no existe, crearlo con el token Symbol y la interfaz.

### 3. Gateway

En `src/modules/${input:moduleName}/infrastructure/adapters/spapi.${input:moduleName}.gateway.ts`:

```ts
async newMethod(input: InputDto): Promise<OutputDto> {
  const raw = await this.spapi.callAPI({
    endpoint: '${input:spapiEndpoint}',
    operation: '${input:spapiOperation}',
    // path:  { asin: input.asin }   ← si tiene path params
    query: {
      marketplaceIds: [input.marketplaceId],
      // resto de query params
    },
    // body: { ... }   ← si es POST/PUT
  });
  return ${input:moduleName|capitalize}Mapper.newMethodToDto(raw);
}
```

### 4. Mapper

En `src/modules/${input:moduleName}/infrastructure/mappers/${input:moduleName}.mapper.infrastructure.ts`:

- Inspeccionar la respuesta real de SP-API (o su documentación) para definir los campos.
- Implementar `newMethodToDto(raw: Record<string, any>): OutputDto` con optional chaining.
- Crear spec cubriendo respuesta completa y respuesta vacía/null.

### 5. DTO de salida

Si la respuesta es nueva, crear en `application/dto/${input:spapiOperation}-response.dto.ts`:
- Campos mapeados desde la respuesta de SP-API.
- `@ApiProperty` en cada campo para Swagger.

### 6. Registro en módulo (si gateway es nuevo o añade imports)

Asegurarse que `SpapiModule` está en `imports` del módulo NestJS correspondiente.

### 7. README.md

Añadir en la sección de endpoints del módulo y en "Endpoints Activos Hoy".

## Verificación de integración

1. El endpoint está registrado en `spapi.config.ts` con su versión.
2. La variable está en `.env.example`.
3. El gateway llama `this.spapi.callAPI` con `endpoint` y `operation` correctos.
4. El mapper maneja respuestas vacías sin explotar (`?? defaultValue`).
5. El spec del mapper tiene al menos un caso con payload real y uno con payload vacío.
