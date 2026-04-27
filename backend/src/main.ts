import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    'exp://*',
    'http://localhost:8081',
  ];
  
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Only listen on a port if not running on Vercel
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 SmartLogix API running on http://localhost:${port}`);
  }

  return app.getHttpAdapter().getInstance();
}

// Export for Vercel
let server: any;
export default async (req: any, res: any) => {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
};
