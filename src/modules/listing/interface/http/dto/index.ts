/** =============================================================
 * ANCHOR: dto-barrel-exports
 * Exportaciones centralizadas de DTOs HTTP del módulo listing.
 * ============================================================= */

export * from './update-listing-item.request-dto.interface';
export * from './patch-listing-item.request-dto.interface';

/** =============================================================
 * ARQUITECTURA HEXAGONAL:
 * Los DTOs HTTP están en interface/http/dto/ porque manejan
 * la entrada/salida HTTP y contienen decoradores de Swagger y validación.
 * ============================================================= */
