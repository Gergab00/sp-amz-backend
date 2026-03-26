import { Module } from '@nestjs/common';
import { CatalogController } from './interface/http/catalog.controller';
import { CatalogService } from './application/services/catalog.service';
import { SpapiModule } from '../../shared/infrastructure/http/spapi/spapi.module';
import { GetCatalogItemUseCase } from './application/use-cases/get-catalog-item.use-case';
import { SearchCatalogItemsUseCase } from './application/use-cases/search-catalog-items.use-case';

@Module({
  imports: [SpapiModule],
  controllers: [CatalogController],
  providers: [CatalogService, GetCatalogItemUseCase, SearchCatalogItemsUseCase],
})
export class CatalogModule {}