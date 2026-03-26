/** =============================================================
 * ANCHOR: mappers-barrel-exports
 * Exportaciones centralizadas de mappers de infraestructura del módulo listing.
 * ============================================================= */

export * from './listing.mapper.infrastructure';
export * from './patch-listing.mapper.infrastructure';

/** =============================================================
 * ARQUITECTURA HEXAGONAL:
 * Los mappers están en infrastructure/ porque implementan la
 * anti-corruption layer entre APIs externas (SP-API) y el dominio.
 * ============================================================= */
