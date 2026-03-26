import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SellingPartner = require('amazon-sp-api');
import { spapiConfig } from './spapi.config';


type CallApiArgs = {
  endpoint: string;
  operation: string;
  path?: any;
  query?: any;
  body?: any;
  options?: any;
};


@Injectable()
export class SpapiClient {
  private readonly sp: any;

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
      return this.sp.callAPI(args);
    } catch (error) {
      // Manejo de errores
      throw new Error(`Error en la llamada a la API de SP-API: ${error}`);
    }
  }
}

// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)