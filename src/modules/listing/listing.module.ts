import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SpapiModule } from '../../shared/infrastructure/http/spapi/spapi.module';
import { ListingController } from './interface/http/listing.controller';
import { ListingService } from './application/services/listing.service';
import { UpdateListingItemUseCase } from './application/use-cases/update-listing-item.use-case';
import { PatchListingItemUseCase } from './application/use-cases/patch-listing-item.use-case';
import { ValidateListingItemMiddleware } from './interface/middlewares/validate-listing-item.middleware';

@Module({
  imports: [SpapiModule],
  controllers: [ListingController],
  providers: [ListingService, UpdateListingItemUseCase, PatchListingItemUseCase],
})
export class ListingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidateListingItemMiddleware).forRoutes('listing'); // Aplica el middleware a las rutas de listado
  }
}
