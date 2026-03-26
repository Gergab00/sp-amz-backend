/** =============================================================
 * ANCHOR: mappers-barrel-exports
 * Exportaciones centralizadas de mappers de infraestructura del módulo pricing.
 * ============================================================= */

export * from './item-offers.mapper.infrastructure';

/** =============================================================
 * ARQUITECTURA HEXAGONAL:
 * Los mappers están en infrastructure/ porque implementan la
 * anti-corruption layer entre APIs externas (SP-API) y el dominio.
 * ============================================================= */
