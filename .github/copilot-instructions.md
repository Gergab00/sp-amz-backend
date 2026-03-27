# Instrucciones de Copilot para sp-amz-backend

## Contexto del proyecto
- Backend en NestJS 11 + TypeScript 5.
- Integracion con Amazon SP-API mediante el cliente `amazon-sp-api` encapsulado en `SpapiClient`.
- API documentada con Swagger (`@nestjs/swagger`) y expuesta en `/api/docs`.
- Validacion de entrada con `class-validator` y `ValidationPipe` global (`whitelist: true`, `transform: true`).
- Prefix global de rutas: `/api`.

## Frameworks y librerias clave
- Core: `@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/platform-express`.
- Seguridad/API: `helmet`, `@nestjs/throttler`, `@nestjs/swagger`.
- Validacion/transformacion: `class-validator`, `class-transformer`.
- Integracion externa: `amazon-sp-api`.
- Persistencia (preparada/no central): `mongoose`, `@nestjs/mongoose`.
- Testing: `jest`, `ts-jest`, `supertest`.
- Calidad: ESLint 9 + Prettier.

## Estructura arquitectonica esperada
El repositorio usa una arquitectura hexagonal por modulo y esta en proceso de consolidacion.
Mantener la separacion por capas en cada modulo dentro de `src/modules`:
- `domain`: entidades, tipos y validaciones de negocio puras.
- `application`: use-cases, DTOs de aplicacion, servicios orquestadores, puertos (`gateways`).
- `interface`: controllers HTTP, DTOs de request/response de transporte, middlewares.
- `infrastructure`: adapters a SP-API y mappers anti-corrupcion.

Reglas de dependencia:
- `domain` no depende de NestJS ni de infraestructura.
- `application` depende de `domain` y de puertos (interfaces), no de adapters concretos.
- `interface` delega al `application` (controllers delgados).
- `infrastructure` implementa puertos de `application`.

## Modulos de negocio actuales
- `catalog`: busqueda y detalle de items de catalogo.
- `pricing`: consulta de ofertas por ASIN.
- `listing`: operaciones de update/patch de listing item.
- `listings`: consulta MFN quantity por SKU/marketplace.
- `fees`: estimacion de comisiones para ASIN.

## Flujo tecnico estandar (obligatorio)
1. Controller recibe request y valida con DTO.
2. Service de aplicacion delega a un use-case.
3. Use-case aplica reglas de negocio y llama un puerto (`...Port`/`...ApiPort`).
4. Adapter de infraestructura implementa el puerto y llama `SpapiClient.callAPI`.
5. Mapper de infraestructura transforma respuesta externa a DTO/estructura de dominio.
6. Controller responde sin logica de negocio embebida.

## Reglas de negocio detectadas (no romper)
- Catalog search:
  - Debe enviarse `identifiers + identifiersType` o `keywords`.
  - No se permite usar ambos a la vez.
  - Si `identifiersType === "SKU"`, `sellerId` es obligatorio.
- Fees estimate:
  - `listingPriceAmount > 0`.
  - `shippingAmount >= 0`.
  - Si existe `shippingCurrency`, debe coincidir con `listingPriceCurrency`.
  - Mismatch moneda-marketplace genera warning (no bloqueo estricto actual).
- Listings MFN quantity:
  - Si no hay `quantity` o `amount` mapeable, se lanza `NotFoundException`.
- Listing update/patch:
  - Middleware valida DTO segun ruta (`patch` vs `update`) antes de llegar al controller.

## Convenciones de implementacion
- Favorcer inyeccion de dependencias con puertos + tokens en modulos (`provide/useClass`).
- Mappers siempre en `infrastructure/mappers` con sufijo `.mapper.infrastructure.ts`.
- Use-cases en `application/use-cases` con sufijo `.usecase.ts` o `.use-case.ts` segun modulo existente.
- DTOs HTTP en `interface/http/dto` para requests/responses de transporte.
- Mantener comentarios `ANCHOR` existentes si se edita un archivo que ya los usa.
- Evitar introducir logica de negocio en controllers, gateways o middlewares.

## Convenciones de API y validacion
- Documentar endpoints nuevos con Swagger: `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
- Documentar DTOs con `@ApiProperty` y ejemplos realistas.
- Usar `class-validator` para reglas de entrada y `class-transformer` para coercion de tipos.
- Mantener naming y textos de API en espanol tecnico cuando ya exista en el modulo.

## Integracion SP-API
- Toda llamada externa pasa por `src/shared/infrastructure/http/spapi/spapi.client.ts`.
- Configuracion centralizada en `spapi.config.ts` (region, credenciales, versiones de endpoint).
- No crear clientes directos a SP-API dentro de use-cases o controllers.
- Si un endpoint SP-API nuevo requiere version especifica, declararla explicitamente en la llamada.

## Testing y calidad
- Crear/actualizar tests unitarios cuando se agregue logica de negocio en entidades, use-cases o mappers.
- Si se modifica un mapper, incluir spec del mapper para casos felices y edge cases.
- Para cambios de contratos HTTP, actualizar DTO tests o e2e segun impacto.
- Comandos clave:
  - `npm run build`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run lint`

## Politica para cambios nuevos
- Priorizar consistencia con la estructura ya presente en `src/modules/*`.
- No mezclar responsabilidad de capas aunque exista deuda tecnica en archivos legacy.
- Si se detecta inconsistencia estructural, preferir correccion incremental en el modulo tocado, no refactor masivo no solicitado.
- Mantener compatibilidad de contratos HTTP existentes salvo requerimiento explicito.

## Politica de README (obligatoria)
En cada cambio importante se debe actualizar `README.md` en el mismo PR.

Se considera cambio importante cuando se modifica al menos uno de estos puntos:
- Stack o dependencias principales.
- Variables de entorno, configuracion de arranque o puertos.
- Endpoints, contratos HTTP, autenticacion o validaciones de entrada.
- Estructura de modulos/capas o flujo arquitectonico.
- Scripts de ejecucion, testing, lint o release.

Checklist minimo obligatorio para actualizar README en esos casos:
1. Ajustar secciones afectadas (setup, config, endpoints, scripts, arquitectura).
2. Verificar que comandos y rutas documentadas existan en el codigo actual.
3. Documentar estado real (por ejemplo, modulo implementado pero no registrado en `AppModule`).
4. Evitar contenido generico no aplicable al repositorio.

## Guia operativa para Copilot
Cuando generes codigo en este repo:
1. Primero ubica el modulo de negocio correcto.
2. Luego aplica el flujo `interface -> application -> infrastructure`.
3. Agrega o reutiliza DTOs con validaciones declarativas.
4. Implementa/usa puertos para desacoplar use-cases de adapters.
5. Añade Swagger y tests minimos asociados al cambio.
6. Verifica que los imports respeten aliases y rutas del proyecto.
7. Si el cambio es importante, actualiza `README.md` en el mismo ciclo de trabajo antes de cerrar la tarea.

## Protocolo Engram (obligatorio)
Antes de iniciar cualquier tarea:
1. Revisar y aplicar las instrucciones de Engram activas en el workspace.
2. Consultar memoria reciente con `mem_context` para recuperar decisiones y estado previo.
3. Buscar conocimiento existente con `mem_search` usando palabras clave del tema.
4. Si hay resultados relevantes, leer el detalle antes de proponer cambios para evitar duplicidad o contradicciones.

Durante y al finalizar una tarea:
1. Guardar decisiones, fixes, descubrimientos y configuraciones relevantes con `mem_save`.
2. Registrar que se hizo, por que, donde y que se aprendio en cada memoria guardada.
3. Cerrar la sesion con `mem_session_summary` para preservar continuidad entre conversaciones.
4. Si no existe memoria previa del tema, crearla al completar el primer resultado estable.

## Nota de continuidad
Este archivo debe tratarse como contexto base para futuras sesiones. Si cambian reglas de negocio, contratos SP-API o estructura por modulo, actualizar estas instrucciones en el mismo PR de cambio funcional.