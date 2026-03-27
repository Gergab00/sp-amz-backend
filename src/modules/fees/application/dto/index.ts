/** =============================================================
 * ANCHOR: dto-barrel-exports
 * Exportaciones centralizadas de DTOs del dominio fees.
 * ============================================================= */

export * from './get-fees-estimate-asin.dto';
export * from './fees-estimate-response.dto';

/** =============================================================
 * ARQUITECTURA LIMPIA:
 * Este archivo barrel facilita las importaciones y mantiene
 * la organización del dominio. Permite importar múltiples DTOs
 * desde un solo punto de entrada.
 *
 * CÓMO EXTENDER:
 * - Agregar nuevos DTOs: crea el archivo y añade export aquí
 *
 * CÓMO MODIFICAR:
 * - Si renombras DTOs, actualiza los exports correspondientes
 * ============================================================= */
