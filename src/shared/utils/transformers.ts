// Utilidades de transformación reutilizables
/**
 * Normaliza distintas formas de entrada a un array de strings o undefined.
 * - Si value es array, devuelve array de strings (trimmed) o undefined si vacío.
 * - Si value es string con separador, lo splittea por `separator`.
 * - Si value es string simple, devuelve array con un elemento.
 * - Si value es null/undefined/empty string, devuelve undefined.
 */
export function toStringArray(value: unknown, separator = ','): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  const v = String(value).trim();
  if (!v) return undefined;
  if (v.includes(separator)) return v.split(separator).map((s) => s.trim()).filter(Boolean);
  return [v];
}
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
