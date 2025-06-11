import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Opcional: prefijo global para tu API
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
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
