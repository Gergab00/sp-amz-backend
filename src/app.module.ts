// RUTA: /src/app.module.ts
// ANCHOR: app-module
/** Módulo raíz: Config y composition root */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)