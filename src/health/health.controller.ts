// RUTA: /src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  ok() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)