if (process.env.TRACING_ENABLED === 'true') require('./tracing');

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const debugMode = process.env.NODE_ENV || 'development';
  if (debugMode === 'development') {
    mongoose.set('debug', true);
  }

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV != 'production'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['error', 'warn'],
  });

  app.useLogger(app.get(Logger));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);

  const apiVersion = configService.get<string>('API_VERSION');
  app.setGlobalPrefix(`api/${apiVersion}`);

  app.enableCors();

  //app.enableShutdownHooks();

  app.use(cookieParser(process.env.COOKIE_SECRET));

  const config = new DocumentBuilder()
    .setTitle('Sample API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT');
  try {
    await app.listen(port);
  } catch (e) {
    console.log('Failed to start application:', e);
    console.log('Retrying...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
})