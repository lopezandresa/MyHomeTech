import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Configuración de CORS más permisiva para desarrollo
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL') || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Configuración básica de Swagger
  const config = new DocumentBuilder()
    .setTitle('API MyHomeTech')
    .setDescription('Documentación de todos los endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Pon aquí tu token JWT (Bearer <token>)'
      },
      'JWT',
    )   // Habilita autorización JWT en Swagger UI
    .build();

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
