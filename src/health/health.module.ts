// RUTA: /src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({ controllers: [HealthController] })
export class HealthModule {}
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
