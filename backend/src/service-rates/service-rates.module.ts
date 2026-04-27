import { Module } from '@nestjs/common';
import { ServiceRatesService } from './service-rates.service';
import { ServiceRatesController } from './service-rates.controller';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [DriversModule],
  controllers: [ServiceRatesController],
  providers: [ServiceRatesService],
  exports: [ServiceRatesService],
})
export class ServiceRatesModule {}
