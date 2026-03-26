// RUTA: /src/infra/http/spapi/spapi.config.ts
// ANCHOR: spapi-config
/** Lee configuración de SP‑API desde env y define versions por endpoint. */
export const spapiConfig = () => ({
  region: (process.env.SP_REGION || 'na') as 'na'|'eu'|'fe',
  refresh_token: process.env.SP_REFRESH_TOKEN!,
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: process.env.SP_APP_CLIENT_ID!,
    SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SP_APP_CLIENT_SECRET!,
  },
  endpoints_versions: {
      catalogItems: process.env.SP_ENDPOINTS_VERSIONS__catalogItems || '2020-12-01',
      listingsItems: process.env.SP_ENDPOINTS_VERSIONS__listingsItems || '2021-08-01',
      productFees: process.env.SP_ENDPOINTS_VERSIONS__productFees || 'v0',
    },
  });

  /** =============================================================
   * ANCHOR: marketplaces-constants
   * Constantes de marketplace IDs comunes (MX, US, CA, BR, etc.)
   * ============================================================= */
  export const MARKETPLACE_IDS = {
    MX: 'A1AM78C64UM0Y8',
    US: 'ATVPDKIKX0DER',
    CA: 'A2EUQ1WTGCTBG2',
    BR: 'A2Q3Y263D00KWC',
    // Agrega más según necesidad
  };

  /** =============================================================
   * ANCHOR: currency-constants
   * Constantes de monedas válidas por región/marketplace
   * ============================================================= */
  export const VALID_CURRENCIES = ['MXN', 'USD', 'CAD', 'BRL', 'EUR', 'GBP', 'JPY'] as const;
  export type Currency = typeof VALID_CURRENCIES[number];

  /** Mapeo de marketplace a moneda predeterminada */
  export const MARKETPLACE_CURRENCY_MAP: Record<string, Currency> = {
    [MARKETPLACE_IDS.MX]: 'MXN',
    [MARKETPLACE_IDS.US]: 'USD',
    [MARKETPLACE_IDS.CA]: 'CAD',
    [MARKETPLACE_IDS.BR]: 'BRL',
  };

  /** =============================================================
   * ANCHOR: env-vars-spapi
   * Variables de entorno requeridas para SP-API:
   * - SP_REGION: Región SP-API ('na', 'eu', 'fe')
   * - SP_REFRESH_TOKEN: Token de refresh LWA
   * - SP_APP_CLIENT_ID: Client ID de la app
   * - SP_APP_CLIENT_SECRET: Client Secret de la app
   * - SP_ENDPOINTS_VERSIONS__catalogItems: Versión de Catalog Items API
   * - SP_ENDPOINTS_VERSIONS__listingsItems: Versión de Listings Items API
   * - SP_ENDPOINTS_VERSIONS__productFees: Versión de Product Fees API (v0)
   * ============================================================= */
  // Estas variables deben estar definidas en tu entorno (.env, variables de CI/CD, etc.)
  // Ejemplo de .env:
  // SP_REGION=na
  // SP_REFRESH_TOKEN=xxxx
  // SP_APP_CLIENT_ID=xxxx
  // SP_APP_CLIENT_SECRET=xxxx
  // SP_ENDPOINTS_VERSIONS__catalogItems=2020-12-01
  // SP_ENDPOINTS_VERSIONS__listingsItems=2021-08-01
  // SP_ENDPOINTS_VERSIONS__productFees=v0

  // =============================================================
  // ARQUITECTURA LIMPIA: Este archivo centraliza la configuración y constantes
  // para la integración con SP-API, permitiendo modificar endpoints, versiones,
  // marketplaces y monedas sin afectar el resto del dominio.
  //
  // CÓMO EXTENDER:
  // - Para agregar nuevos marketplaces: añade al objeto MARKETPLACE_IDS
  // - Para nuevas monedas: agrégalas al array VALID_CURRENCIES
  // - Para nuevos endpoints: añade versión en endpoints_versions
  // - Para mapeos marketplace↔moneda: actualiza MARKETPLACE_CURRENCY_MAP
  //
  // MODIFICAR:
  // - Si SP-API cambia versiones, actualiza los valores por defecto
  // - Si cambian variables de entorno, actualiza nombres y documentación
  // =============================================================