/** =============================================================
 * ANCHOR: gateways-barrel-exports
 * Exportaciones centralizadas de gateways/ports del dominio fees.
 * ============================================================= */

export * from './product-fees.port';

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este archivo barrel facilita las importaciones y mantiene
 * la organización del dominio. Permite importar puertos desde
 * un solo punto de entrada.
 *
 * CÓMO EXTENDER:
 * - Agregar nuevos puertos: crea el archivo y añade export aquí
 *
 * CÓMO MODIFICAR:
 * - Si renombras puertos, actualiza los exports correspondientes
 * ============================================================= */
