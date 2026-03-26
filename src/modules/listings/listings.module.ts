import { Module } from '@nestjs/common';
import { ListingsController } from './interface/http/listings.controller';
import { ListingsService } from './application/listings.service';
import { GetMfnQuantityUseCase } from './application/use-cases/get-mfn-quantity.usecase';
import { ListingsMapper } from './infrastructure/mappers/listings.mapper.infrastructure';
import { SpapiListingsGateway } from './infrastructure/adapters/spapi.listings.gateway';
import { SpapiModule } from '../../shared/infrastructure/http/spapi/spapi.module';

/**
 * Módulo Listings: Registra todos los componentes del dominio MFN Listings.
 * Cumple con Clean Architecture: cada provider es inyectable y desacoplado.
 * Para extender, agrega nuevos use-cases, mappers o gateways en los arrays de providers y controllers.
 */
@Module({
  imports: [SpapiModule], // <--- Importa el módulo que provee SpapiClient
  controllers: [ListingsController],
  providers: [
    ListingsService,
    GetMfnQuantityUseCase,
    ListingsMapper,
    {
      provide: 'ListingsApiPort',
      useClass: SpapiListingsGateway,
    },
  ],
  exports: [ListingsService],
})
export class ListingsModule {}

/**
 * Extensión:
 * - Para nuevos endpoints, crea el use-case y agrégalo en providers.
 * - Para cambiar el gateway, modifica el provider 'ListingsApiPort'.
 * - Para pruebas, usa mocks en lugar de SpapiListingsGateway.
 */
