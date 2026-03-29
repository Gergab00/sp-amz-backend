// RUTA: /src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from '../shared/interface/http/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  ok() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
