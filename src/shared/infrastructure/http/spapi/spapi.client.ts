import { Injectable } from '@nestjs/common';
import SellingPartner from 'amazon-sp-api';
import { spapiConfig } from './spapi.config';

type CallApiArgs = {
  endpoint: string;
  operation: string;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  options?: Record<string, unknown>;
};

@Injectable()
export class SpapiClient {
  private readonly sp: SellingPartner;

  constructor() {
    const cfg = spapiConfig();
    this.sp = new SellingPartner({
      region: cfg.region,
      refresh_token: cfg.refresh_token,
      credentials: cfg.credentials,
      endpoints_versions: cfg.endpoints_versions,
    });
  }

  async callAPI<T = any>(args: CallApiArgs): Promise<T> {
    try {
      return await this.sp.callAPI(args);
    } catch (error) {
      // Manejo de errores
      throw new Error(`Error en la llamada a la API de SP-API: ${error}`);
    }
  }
}

// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
