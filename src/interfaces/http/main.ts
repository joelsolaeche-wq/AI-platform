/**
 * NestJS HTTP entry point.
 * Datadog must be initialized FIRST, before any instrumented module is imported.
 */
import 'reflect-metadata';
import { initDatadog } from '../../infrastructure/observability/Datadog';
import { initSentry, Sentry } from '../../infrastructure/observability/Sentry';
import { loadEnv } from '../../infrastructure/config/env';

const env = loadEnv();
initDatadog(env.datadog.service, env.datadog.env);
initSentry(env.sentry.dsn, env.nodeEnv);

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');

  await app.listen(env.port);
  Logger.log(`🚀 API ready on http://localhost:${env.port}/api`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Sentry.captureException(err);
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
