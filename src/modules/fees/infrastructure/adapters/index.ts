/** =============================================================
 * ANCHOR: adapters-barrel-exports
 * Exportaciones centralizadas de adapters/gateways del dominio fees.
 * ============================================================= */

export * from './spapi.product-fees.gateway';

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este archivo barrel facilita las importaciones y mantiene
 * la organización de la infraestructura. Permite importar
 * implementaciones de gateways desde un solo punto de entrada.
 *
 * CÓMO EXTENDER:
 * - Agregar nuevos gateways: crea el archivo y añade export aquí
 * - Para mocks: agrega exports de implementaciones mock
 *
 * CÓMO MODIFICAR:
 * - Si renombras gateways, actualiza los exports correspondientes
 * ============================================================= */
