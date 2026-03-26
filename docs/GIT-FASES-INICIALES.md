# Fases iniciales de Git

Este documento define una reconstruccion logica del historial inicial del proyecto para mantener ramas y commits congruentes con la arquitectura actual.

## Rama base

- `dev`: rama de preparacion e integracion antes de master.
- `master`: rama principal prevista para releases una vez terminada la base.

## Fases y commits

### Fase 1. Base tecnica

Objetivo: dejar el proyecto ejecutable con NestJS, TypeScript y tooling de calidad.

Archivos principales:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.build.json`
- `nest-cli.json`
- `eslint.config.mjs`
- `commitlint.config.cjs`
- `.prettierrc`
- `.gitignore`
- `.dockerignore`
- `.releaserc.json`
- `Dockerfile`
- `.husky/`
- `.github/workflows/`
- `.vscode/`

Commit sugerido:

- `chore(init): bootstrap nestjs project tooling and release config`

### Fase 2. Documentacion

Objetivo: registrar lineamientos, ADR y scripts operativos.

Archivos principales:

- `README.md`
- `CHANGELOG.md`
- `docs/ADR-001-migracion-arquitectura-hexagonal.md`
- `docs/TEST-BASELINE-PRE-MIGRACION.md`
- `docs/GIT-FASES-INICIALES.md`
- `.github/copilot-instructions.md`
- `.github/instructions/`
- `scripts/`

Commit sugerido:

- `docs(repo): add architecture, workflow and bootstrap documentation`

### Fase 3. Bootstrap de aplicacion

Objetivo: dejar la aplicacion arrancando con modulo raiz y health checks.

Archivos principales:

- `src/main.ts`
- `src/app.module.ts`
- `src/app.controller.ts`
- `src/app.service.ts`
- `src/app.controller.spec.ts`
- `src/health/`

Commits sugeridos:

- `feat(bootstrap): add nest entrypoint and root module`
- `feat(health): add health module and controller`

### Fase 4. Shared transversal

Objetivo: consolidar contratos, utilidades y cliente SP-API reutilizable.

Archivos principales:

- `src/shared/constants/`
- `src/shared/domain/`
- `src/shared/interface/`
- `src/shared/utils/`
- `src/shared/infrastructure/http/spapi/`

Commits sugeridos:

- `feat(shared): add shared abstractions and constants`
- `feat(shared): add reusable utilities and http interfaces`
- `feat(spapi): add shared amazon sp-api client infrastructure`

### Fase 5. Modulos de negocio

Objetivo: desarrollar cada bounded context en una rama dedicada a partir de la base shared.

Ramas sugeridas:

- `feat/catalog-bootstrap`
- `feat/pricing-bootstrap`
- `feat/fees-bootstrap`
- `feat/listing-bootstrap`
- `feat/listings-bootstrap`

Orden sugerido:

1. `catalog`
2. `pricing`
3. `fees`
4. `listing`
5. `listings`

Para cada modulo, usar 2 o 3 commits:

1. Dominio y DTOs base.
2. Casos de uso, servicios y controller HTTP.
3. Adapters, mappers y tests cuando aplique.

## Integracion

Una vez cerradas las ramas de modulo, integrar sobre `master` validando `npm run build`, `npm run lint` y `npm run test` segun corresponda.