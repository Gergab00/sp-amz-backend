// RUTA: /src/app.module.ts
// ANCHOR: app-module
/** Módulo raíz: Config y composition root */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { FeesModule } from './modules/fees/fees.module';
import { ListingModule } from './modules/listing/listing.module';
import { ListingsModule } from './modules/listings/listings.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { SpapiModule } from './shared/infrastructure/http/spapi/spapi.module';
import { ApiKeyGuard } from './shared/interface/http/guards/api-key.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    CatalogModule,
    PricingModule,
    FeesModule,
    ListingModule,
    ListingsModule,
    SpapiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
