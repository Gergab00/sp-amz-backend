// RUTA: /src/infra/http/spapi/spapi.module.ts
// ANCHOR: spapi-module
import { Module } from '@nestjs/common';
import { SpapiClient } from './spapi.client';

@Module({

  providers: [SpapiClient],
  exports: [SpapiClient],
})
export class SpapiModule {}

// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)