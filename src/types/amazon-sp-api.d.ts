declare module 'amazon-sp-api' {
  export type SpApiCallArgs = {
    endpoint: string;
    operation: string;
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    options?: Record<string, unknown>;
  };

  export type SellingPartnerConfig = {
    region: 'na' | 'eu' | 'fe';
    refresh_token: string;
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: string;
      SELLING_PARTNER_APP_CLIENT_SECRET: string;
    };
    endpoints_versions: Record<string, string>;
  };

  export default class SellingPartner {
    constructor(config: SellingPartnerConfig);
    callAPI<T = any>(args: SpApiCallArgs): Promise<T>;
  }
}
