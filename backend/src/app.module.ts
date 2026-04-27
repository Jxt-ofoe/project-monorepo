import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { ServiceRatesModule } from './service-rates/service-rates.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // Config first — makes env vars available to all modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database — global so any module can inject DB_TOKEN without re-importing
    DatabaseModule,

    // Feature modules
    UsersModule,
    AuthModule,
    VehiclesModule,
    DriversModule,
    ServiceRatesModule,
    ShipmentsModule,
    InvoicesModule,
    AnalyticsModule,
    NotificationsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
