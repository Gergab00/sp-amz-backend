// RUTA: /src/modules/pricing/application/services/pricing.service.ts
import { Injectable } from '@nestjs/common';
import { SpapiClient } from '../../../../shared/infrastructure/http/spapi/spapi.client';
import { GetItemOffersUseCase } from '../use-cases/get-item-offers.use-case';
import { GetItemOffersDto } from '../dto/get-item-offers.dto';

// ANCHOR: tipos-pricing
/**
 * Condición de ítem permitida por la SP-API de precios.
 * @typedef {('New'|'Used'|'Collectible'|'Refurbished'|'Club')} ItemCondition
 */
export type ItemCondition = 'New' | 'Used' | 'Collectible' | 'Refurbished' | 'Club';

// ANCHOR: servicio-pricing
/**
 * Servicio de Pricing para consultar ofertas de productos vía SP-API.
 *
 * @class PricingService
 * @see SpapiClient
 */
@Injectable()
export class PricingService {
  constructor(
    private readonly sp: SpapiClient,
    private readonly getItemOffersUseCase: GetItemOffersUseCase
  ) {}

  // SECTION: Método principal - getItemOffers
  /**
   * Obtiene ofertas por ASIN usando la SP-API Product Pricing (versión 2022-05-01).
   *
   * @param dto DTO de entrada con los parámetros de consulta.
   * @returns {Promise<any>} Respuesta de la SP-API con las ofertas encontradas.
   * @throws Error si la llamada a la SP-API falla.
   */
  async getItemOffers(dto: GetItemOffersDto): Promise<any> {
    return this.getItemOffersUseCase.execute(dto);
  }
}

/* ============================================================
  AUDITORÍA DEL ARCHIVO
  -------------------------------------------------------------
  1) RESPONSABILIDADES (SRP)
  - Definir el tipo de condición de ítem para pricing.
  - Exponer el servicio principal para consultar ofertas de productos vía SP-API.

  2) ANÁLISIS CLEAN CODE (0–100)
  - Nombres: 9/10 – Claros y consistentes, salvo algún parámetro genérico.
  - SRP y cohesión: 10/10 – Cada unidad cumple una sola responsabilidad.
  - Bajo acoplamiento: 9/10 – Depende solo de SpapiClient, inyectado.
  - DRY: 10/10 – Sin duplicación.
  - KISS: 9/10 – Lógica directa y simple.
  - Estructura y formato: 10/10 – Ordenado, bien delimitado.
  - Gestión de errores: 8/10 – Se delega a SpapiClient, pero no se documenta manejo de errores.
  - Separación de capas: 10/10 – Cumple con arquitectura limpia.
  - Testabilidad: 9/10 – Fácil de mockear y probar.
  - Documentación: 10/10 – Documentado y con anchors.
  => PUNTUACIÓN TOTAL: 94/100

  Fortalezas:
  - Cohesión y SRP ejemplares.
  - Documentación clara y anchors útiles.
  - Estructura limpia y mantenible.

  Oportunidades:
  - Mejorar documentación de errores y casos borde.
  - Validar parámetros antes de llamar a la API.

  3) RIESGOS / CODE SMELLS
  - [P2] Falta validación explícita de parámetros → Puede causar errores en tiempo de ejecución → Validar antes de llamar a la API.
  - [P3] Gestión de errores delegada → Si SpapiClient no maneja bien los errores, puede propagarse sin control.

  4) MEJORAS PRIORIZADAS
  - P1: Validar parámetros de entrada (asin, marketplaceId).
  - P2: Documentar y manejar errores explícitamente.
  - P3: Tipar mejor la respuesta de la API (evitar any).

  5) ESTIMACIONES ORIENTATIVAS
  - Complejidad ciclomatica (aprox.): getItemOffers ~ 3
  - Acoplamiento: bajo
  - Cohesión: alta
  - Deuda técnica: baja

  6) SUGERENCIAS DE PRUEBAS
  - Unitarias: Mock de SpapiClient, casos con distintos itemCondition y marketplaceId.
  - Integración: Llamadas reales a la SP-API con ASINs válidos/erróneos.
  - Casos borde/errores: marketplaceId vacío, itemCondition inválido, error de red/API.
============================================================ */
