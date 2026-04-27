import { Global, Module } from '@nestjs/common';
import { createDrizzleClient } from './client';

export const DATABASE_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: () => {
        const db = createDrizzleClient();
        console.log('[SmartLogix] Database connection established ✓');
        return db;
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
