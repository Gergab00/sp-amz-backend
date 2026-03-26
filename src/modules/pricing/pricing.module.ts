import { Module } from '@nestjs/common';
import { SpapiModule } from '../../shared/infrastructure/http/spapi/spapi.module';
import { PricingService } from './application/services/pricing.service';
import { PricingController } from './interface/http/pricing.controller';
import { GetItemOffersUseCase } from './application/use-cases/get-item-offers.use-case';

@Module({
    imports: [SpapiModule],
    providers: [PricingService, GetItemOffersUseCase],
    controllers: [PricingController],
})
export class PricingModule {}
