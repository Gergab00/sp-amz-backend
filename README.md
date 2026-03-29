# sp-amz-backend

Backend en NestJS para integracion con Amazon SP-API, organizado por modulos de negocio y capas tipo hexagonal (domain, application, interface, infrastructure).

## Estado Actual Del Proyecto

El repositorio contiene implementaciones por modulo para catalog, pricing, fees, listing y listings.

Estado de registro en runtime hoy:

- Registrado en AppModule: ConfigModule, HealthModule, CatalogModule, PricingModule, FeesModule, ListingModule, ListingsModule y SpapiModule.

Implicacion:

- Los endpoints de negocio definidos en los controladores quedan activos en runtime y se exponen en Swagger/OpenAPI.

## Stack Tecnologico

- NestJS 11 + TypeScript 5
- Integracion Amazon SP-API con amazon-sp-api
- Swagger/OpenAPI con @nestjs/swagger
- Validacion con class-validator y class-transformer
- Seguridad con helmet + API key global por header x-api-key
- Preparacion de persistencia con mongoose/@nestjs-mongoose
- Testing con jest, ts-jest y supertest
- Calidad con ESLint 9 y Prettier
- Flujo Git con Husky, Commitlint y semantic-release

## Requisitos

- Node.js 20 o superior (recomendado)
- npm para desarrollo local
- pnpm (via Corepack) para flujos que dependen de pnpm-lock.yaml, como build de Docker/Railway

## Instalacion

```bash
npm install
```

Alternativa con pnpm:

```bash
corepack enable
pnpm install --frozen-lockfile
```

## Configuracion De Entorno

Base de variables en .env.example.

Variables principales:

- PORT (opcional): puerto HTTP. Si no se define, la app usa 5111.
- NODE_ENV
- API_KEY: llave compartida para autenticar llamadas externas via header x-api-key.
- SP_REGION
- SP_REFRESH_TOKEN
- SP_APP_CLIENT_ID
- SP_APP_CLIENT_SECRET
- SP_ENDPOINTS_VERSIONS__catalogItems

Nota: en .env.example aparece PORT=3000; ese valor sobreescribe el default 5111 en runtime cuando se define.

## Ejecucion Local

```bash
# desarrollo con watch
npm run start:dev

# modo normal
npm run start

# modo debug
npm run start:debug

# build
npm run build

# produccion (requiere build previo)
npm run start:prod
```

Notas operativas:

- Para pnpm usa `pnpm run start:dev`.
- El build incremental de Nest ahora guarda su metadata dentro de `dist/` para evitar el caso en que `deleteOutDir` borra la salida compilada pero deja un `tsconfig*.tsbuildinfo` viejo en la raiz y el watch termina intentando ejecutar `dist/main` sin haber reemitido archivos.

## Configuracion HTTP De La Aplicacion

Configuracion vigente en src/main.ts:

- Prefijo global de rutas: /api
- Swagger UI: /api/docs
- Scalar API Reference: /api/scalar
- OpenAPI JSON: /api/docs-json
- Swagger declara autenticacion global por API key en header x-api-key
- Swagger conserva la autorizacion cargada en la UI durante la sesion del navegador
- CORS habilitado para:
  - https://sellercontrol-ui.gerardogabriel.dev
  - http://localhost:3000
  - http://localhost:3001
  - http://localhost:3002
- Header permitido para autenticacion: x-api-key
- ValidationPipe global con:
  - whitelist: true
  - transform: true
- Guard global de autenticacion por API key (APP_GUARD)
- Rutas publicas sin API key:
  - GET /api/health
  - GET /api/docs
  - GET /api/scalar
  - GET /api/docs-json

## Autenticacion API Key

La aplicacion valida el header `x-api-key` en cada request protegida contra el valor de `API_KEY` definido en el entorno.

Comportamiento:

- Si falta `API_KEY` en el entorno, la aplicacion responde 500 en endpoints protegidos.
- Si falta `x-api-key` o no coincide, responde 401.
- `health` y la documentacion quedan publicos para observabilidad y exploracion de API.

Genera una API Key segura con Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ Nunca subas `.env` al repositorio. Contiene credenciales y secretos.

Ejemplo:

```bash
curl -H "x-api-key: <tu_api_key>" http://localhost:5111/api
```

## Endpoints Activos Hoy

Con el estado actual de AppModule, los endpoints activos son:

- GET /api/health
- GET /api (protegido por API key)
- GET /api/docs
- GET /api/scalar
- GET /api/docs-json
- GET /api/catalog/items/search
- GET /api/catalog/items/:asin
- GET /api/pricing/items/:asin/offers
- POST /api/fees/asin-estimate
- POST /api/listing/update
- POST /api/listing/patch
- GET /api/listings/mfn-quantity

## Uso De Swagger Con API Key

La UI de Swagger expone el boton Authorize para cargar x-api-key una sola vez y enviarlo automaticamente en todos los endpoints protegidos del documento.

Flujo recomendado:

- Abrir /api/docs
- Pulsar Authorize
- Ingresar el valor de x-api-key
- Ejecutar requests desde Swagger sin volver a escribir el header en cada endpoint

## Endpoints De Negocio Expuestos

Catalog:

- GET /api/catalog/items/search
- GET /api/catalog/items/:asin

Pricing:

- GET /api/pricing/items/:asin/offers

Fees:

- POST /api/fees/asin-estimate

Listing:

- POST /api/listing/update
- POST /api/listing/patch

Listings:

- GET /api/listings/mfn-quantity

## Reglas De Validacion De Negocio Relevantes

Catalog search:

- Debe enviarse identifiers + identifiersType o keywords.
- No se permite enviar ambos grupos a la vez.
- Si identifiersType es SKU, sellerId es obligatorio.

Fees estimate:

- listingPriceAmount debe ser mayor a 0.
- shippingAmount debe ser mayor o igual a 0.
- listingPriceCurrency esta restringida a monedas soportadas.
- shippingCurrency se valida contra set de monedas soportadas.

## Estructura Del Proyecto

```text
src/
  app.module.ts
  main.ts
  health/
  modules/
    catalog/
    pricing/
    fees/
    listing/
    listings/
  shared/
    infrastructure/http/spapi/
```

Cada modulo sigue separacion por capas:

- domain: reglas y tipos de negocio
- application: casos de uso, DTOs y servicios orquestadores
- interface: controladores HTTP y contratos de transporte
- infrastructure: adapters, mappers e integraciones externas

## Scripts Disponibles

Compilacion y ejecucion:

- npm run build
- npm run start
- npm run start:dev
- npm run start:debug
- npm run start:prod

Calidad:

- npm run lint
- npm run format

Testing:

- npm run test
- npm run test:watch
- npm run test:cov
- npm run test:debug
- npm run test:e2e

Ejemplo de test puntual:

```bash
npm run test -- src/shared/utils/transformers.spec.ts
```

Git y release:

- npm run prepare
- npm run commitlint
- npm run release
- npm run release:dry

## Flujo De Commits, Changelog Y Releases

Este repositorio usa Conventional Commits + Husky + Commitlint + semantic-release para versionado automatico.

Reglas clave:

- Commits con formato Conventional Commits (commitlint.config.cjs).
- Hook pre-commit: ejecuta npm run lint.
- Hook commit-msg: valida mensaje con commitlint.
- Releases automaticos desde rama master (configurado en .releaserc.json).
- Changelog en CHANGELOG.md y tag con formato vX.Y.Z.

## Roadmap Tecnico Inmediato

- Registrar modulos de negocio en src/app.module.ts para habilitar endpoints ya implementados.
- Consolidar wiring por puertos/tokens en todos los modulos segun la guia hexagonal.
- Completar cobertura de tests unitarios de mappers y use-cases en modulos fees/listing/listings.
