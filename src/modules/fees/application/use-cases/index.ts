/** =============================================================
 * ANCHOR: use-cases-barrel-exports
 * Exportaciones centralizadas de use cases del dominio fees.
 * ============================================================= */

export * from './get-fees-estimate-asin.usecase';

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este archivo barrel facilita las importaciones y mantiene
 * la organización del dominio. Permite importar use cases desde
 * un solo punto de entrada.
 * 
 * CÓMO EXTENDER:
 * - Agregar nuevos use cases: crea el archivo y añade export aquí
 * - Para use cases relacionados: mantén organización por feature
 * 
 * CÓMO MODIFICAR:
 * - Si renombras use cases, actualiza los exports correspondientes
 * ============================================================= */
