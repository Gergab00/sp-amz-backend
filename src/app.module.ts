// RUTA: /src/app.module.ts
// ANCHOR: app-module
/** Módulo raíz: Config y composition root */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { SpapiModule } from './shared/infrastructure/http/spapi/spapi.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        HealthModule,
        SpapiModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)