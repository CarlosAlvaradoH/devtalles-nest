import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('=== DIAGNÓSTICO DE INICIO ===');
  console.log('1. Variables de entorno disponibles:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
  console.log('2. PORT desde process.env:', process.env.PORT);
  console.log('3. MONGODB desde process.env:', process.env.MONGODB ? 'Definida' : 'NO DEFINIDA');

  try {
    const app = await NestFactory.create(AppModule);
    console.log('4. AppModule creado exitosamente');

    app.setGlobalPrefix('api/v2');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const port = process.env.PORT || 3002;
    console.log('5. Intentando usar puerto:', port);

    await app.listen(port);
    console.log(`6. ✅ App corriendo en puerto ${port}`);
  } catch (error) {
    console.error('❌ Error en bootstrap:', error);
    throw error;
  }
}
bootstrap();
