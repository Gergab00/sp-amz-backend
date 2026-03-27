# sp-amz-backend

Backend en NestJS para integracion con Amazon SP-API, organizado por modulos de negocio y capas tipo hexagonal (domain, application, interface, infrastructure).

## Estado Actual Del Proyecto

El repositorio contiene implementaciones por modulo para catalog, pricing, fees, listing y listings.

Estado de registro en runtime hoy:

- Registrado en AppModule: ConfigModule, HealthModule, SpapiModule.
- Modulos de negocio: existen en codigo, pero no estan importados aun en el modulo raiz.

Implicacion:

- Endpoints de negocio definidos en controladores aun no quedan activos mientras no se registren sus modulos en src/app.module.ts.

## Stack Tecnologico

- NestJS 11 + TypeScript 5
- Integracion Amazon SP-API con amazon-sp-api
- Swagger/OpenAPI con @nestjs/swagger
- Validacion con class-validator y class-transformer
- Seguridad base con helmet
- Preparacion de persistencia con mongoose/@nestjs-mongoose
- Testing con jest, ts-jest y supertest
- Calidad con ESLint 9 y Prettier
- Flujo Git con Husky, Commitlint y semantic-release

## Requisitos

- Node.js 20 o superior (recomendado)
- npm (el repo tambien incluye pnpm-lock.yaml para pipelines/release)

## Instalacion

```bash
npm install
```

## Configuracion De Entorno

Base de variables en .env.example.

Variables principales:

- PORT (opcional): puerto HTTP. Si no se define, la app usa 5111.
- NODE_ENV
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

## Configuracion HTTP De La Aplicacion

Configuracion vigente en src/main.ts:

- Prefijo global de rutas: /api
- Swagger UI: /api/docs
- Scalar API Reference: /api/scalar
- OpenAPI JSON: /api/docs-json
- CORS habilitado para:
  - https://sellercontrol-ui.gerardogabriel.dev
  - http://localhost:3000
  - http://localhost:3001
  - http://localhost:3002
- ValidationPipe global con:
  - whitelist: true
  - transform: true

## Endpoints Activos Hoy

Con el estado actual de AppModule, los endpoints activos son:

- GET /api/health
- GET /api
- GET /api/docs
- GET /api/scalar
- GET /api/docs-json

## Endpoints Implementados En Codigo (Pendientes De Registro En AppModule)

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
