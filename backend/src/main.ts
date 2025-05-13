/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { static as expressStatic } from 'express';
import path, { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // trust proxy nestjs
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
