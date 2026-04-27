import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { ServiceRatesModule } from '../service-rates/service-rates.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [ServiceRatesModule, DriversModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
