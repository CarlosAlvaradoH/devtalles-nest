import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {

        exposeUnsetFields: false,
        enableImplicitConversion: true,

      }
    })
  );

  const port = process.env.PORT || 3002;

  await app.listen(port);
}
bootstrap();
