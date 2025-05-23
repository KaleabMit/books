import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4300'], // Allow multiple origins
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(5000);
}
bootstrap().then();