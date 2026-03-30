---
mode: 'agent'
description: 'Agrega un nuevo caso de uso (use-case) a un módulo existente, con puerto, gateway y mapper'
---

Agrega un nuevo caso de uso al módulo indicado, siguiendo el patrón puerto → use-case → gateway → mapper del proyecto.

## Módulo destino

${input:moduleName:Nombre del módulo existente (ej. catalog, pricing, fees, listing, listings)}

## Nombre de la operación

${input:operationName:Nombre de la operación en camelCase (ej. getCompetitivePricing, createReport)}

## Endpoint SP-API

${input:spapiEndpoint:Nombre del endpoint SP-API (ej. productPricing, reportsApi)}

## Operación SP-API

${input:spapiOperation:Nombre de la operación SP-API (ej. getCompetitivePricing, createReport)}

## Método HTTP

${input:httpMethod:Método HTTP: GET | POST | PUT | PATCH | DELETE}

## Ruta HTTP

${input:httpRoute:Ruta relativa dentro del módulo (ej. items/:asin/competitive-pricing)}

---

## Instrucciones para el agente

### Si el módulo NO tiene puerto aún (ej. catalog)

Crea el puerto desde cero:
```
src/modules/${input:moduleName}/application/gateways/${input:moduleName}-api.port.ts
src/modules/${input:moduleName}/application/gateways/index.ts
```

### Si el módulo YA tiene un puerto

Añade el nuevo método a la interfaz existente sin eliminar los métodos ya declarados.

### Use-case

Crea `src/modules/${input:moduleName}/application/use-cases/${input:operationName}-${input:moduleName}.usecase.ts`:
- Inyecta el puerto con `@Inject(PORT_TOKEN)`.
- No importa `SpapiClient` ni adapters directamente.
- Aplica validaciones de negocio antes de llamar al puerto.
- Crea el spec `${input:operationName}-${input:moduleName}.usecase.spec.ts` cubriendo:
  - Caso feliz: el puerto devuelve datos → el use-case los retorna correctamente.
  - Caso de error: el puerto lanza excepción → el use-case relanza o transforma.

### Mapper (si la respuesta SP-API es nueva)

Crea o extiende `src/modules/${input:moduleName}/infrastructure/mappers/${input:moduleName}.mapper.infrastructure.ts`:
- Método estático `${input:operationName}ToDto(raw)`.
- Spec del mapper: payload completo, payload mínimo/vacío.

### Gateway

Extiende (no reemplaza) `src/modules/${input:moduleName}/infrastructure/adapters/spapi.${input:moduleName}.gateway.ts`:
- Implementa el nuevo método del puerto.
- Usa `this.spapi.callAPI({ endpoint: '${input:spapiEndpoint}', operation: '${input:spapiOperation}', ... })`.

### Controller

Extiende `src/modules/${input:moduleName}/interface/http/${input:moduleName}.controller.ts`:
- Agrega el método `${input:operationName}` con `@${input:httpMethod}('${input:httpRoute}')`.
- Decoradores Swagger: `@ApiOperation`, `@ApiOkResponse`, `@ApiResponse(400)`.
- Sin lógica: delega al servicio.

### Servicio

Extiende `src/modules/${input:moduleName}/application/services/${input:moduleName}.service.ts`:
- Agrega el método `${input:operationName}` que llama al use-case.

### README.md

Añade el nuevo endpoint a "Endpoints Activos Hoy" y "Endpoints De Negocio Expuestos".

## Verificación

Confirma que el flujo completo es:
`Controller.${input:operationName} → Service.${input:operationName} → UseCase.execute → Port.method → Gateway → SpapiClient → Mapper → DTO`
