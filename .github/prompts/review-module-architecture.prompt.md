---
mode: 'ask'
description: 'Revisa si un módulo cumple con la arquitectura hexagonal del proyecto y genera un reporte de compliance'
---

Analiza el módulo indicado y genera un reporte detallado de cumplimiento arquitectónico.

## Módulo a revisar

${input:moduleName:Nombre del módulo (ej. catalog, pricing, fees, listing, listings)}

---

## Instrucciones

Lee todos los archivos de `src/modules/${input:moduleName}/` y evalúa los siguientes puntos. Para cada uno indica ✅ (cumple), ⚠️ (cumple parcialmente) o ❌ (no cumple), junto con una descripción concreta del hallazgo.

### 1. Separación de capas

- [ ] `domain/` no importa `@nestjs/*`, infraestructura ni bibliotecas externas.
- [ ] `application/use-cases/` no importa `SpapiClient` directamente.
- [ ] `application/use-cases/` solo depende del puerto (interfaz) para llamadas externas.
- [ ] `interface/http/` no contiene lógica de negocio.
- [ ] `infrastructure/adapters/` implementa la interfaz del puerto.

### 2. Patrón puerto / gateway (port / adapter)

- [ ] Existe un archivo de puerto (interfaz) en `application/gateways/`.
- [ ] El puerto exporta un `Symbol` como token de DI.
- [ ] El módulo NestJS registra `{ provide: TOKEN, useClass: SpapiXxxGateway }` donde el gateway implementa el puerto.
- [ ] El use-case inyecta el puerto con `@Inject(TOKEN)`, no el gateway concreto.

### 3. Convenciones de naming

- [ ] Mappers tienen sufijo `.mapper.infrastructure.ts`.
- [ ] Use-cases tienen sufijo `.usecase.ts` o `.use-case.ts` (consistente dentro del módulo).
- [ ] DTOs HTTP están en `interface/http/dto/`.
- [ ] DTOs de aplicación están en `application/dto/`.

### 4. Swagger / OpenAPI

- [ ] El controller tiene `@ApiTags`.
- [ ] Cada endpoint tiene `@ApiOperation`.
- [ ] Cada endpoint documenta al menos el código 200 con `@ApiOkResponse` o `@ApiResponse`.
- [ ] Los DTOs de entrada tienen `@ApiProperty` en todos los campos.

### 5. Validación de entrada

- [ ] El DTO de entrada usa decoradores de `class-validator`.
- [ ] Las reglas de negocio complejas (mutuamente exclusivas, dependencias entre campos) están en un validator de `domain/validators/`.

### 6. Tests

- [ ] Existe spec para el/los use-case(s) del módulo.
- [ ] Existe spec para el mapper.
- [ ] El spec del use-case mockea el puerto (no el gateway).
- [ ] El spec del mapper prueba payload completo y payload vacío/null.

### 7. Integración SP-API

- [ ] El gateway usa `SpapiClient.callAPI()` (no instancia `SellingPartner` directamente).
- [ ] La versión del endpoint SP-API está declarada en `spapi.config.ts`.
- [ ] El mapper usa optional chaining defensivo en todos los accesos al raw de SP-API.

### 8. Registro en AppModule

- [ ] El módulo está importado en `src/app.module.ts`.

---

## Resultado esperado

Al final del análisis, genera:

1. **Tabla resumen** con todos los ítems y su estado.
2. **Lista de issues críticos** (❌) con archivo y línea afectada.
3. **Lista de mejoras recomendadas** (⚠️) con propuesta concreta de corrección.
4. **Deuda técnica estimada**: número de archivos a crear/modificar para alcanzar compliance completo.
5. Si detectas un issue crítico que puedas corregir de forma localizada (sin refactor masivo), propón el cambio exacto.
