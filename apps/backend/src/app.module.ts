/**
 * @fileoverview Módulo principal de la aplicación MyHomeTech Backend
 * 
 * @description Define la configuración raíz de la aplicación NestJS, incluyendo:
 * - Configuración de base de datos PostgreSQL con TypeORM
 * - Importación de todos los módulos funcionales
 * - Configuración de variables de entorno
 * - Carga automática de entidades
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TechnicianModule } from './technician/technician.module';
import { ClientModule } from './client/client.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ServiceRequestTypeModule } from './service-request-type/service-request-type.module';
import { RatingModule } from './rating/rating.module';
import { NotificationModule } from './notification/notification.module';
import { IdentityModule } from './identity/identity.module';
import { ApplianceModule } from './appliance/appliance.module';
import { ApplianceTypeModule } from './appliance-type/appliance-type.module';
import { ApplianceBrandModule } from './appliance-brand/appliance-brand.module';
import { ApplianceModelModule } from './appliance-model/appliance-model.module';
import { AddressModule } from './address/address.module';
import { HelpTicketModule } from './help-ticket/help-ticket.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Módulo raíz de la aplicación MyHomeTech
 * 
 * @description Configura y conecta todos los módulos de la aplicación:
 * - Módulos de autenticación y usuarios (Auth, Identity, Client, Technician)
 * - Módulos de negocio (ServiceRequest, Rating, Notification)
 * - Módulos de catálogo (Appliance, ApplianceType, ApplianceBrand, ApplianceModel)
 * - Módulos de soporte (Address, HelpTicket)
 * - Configuración de base de datos y variables de entorno
 * 
 * @example
 * ```typescript
 * // El módulo se importa automáticamente en main.ts
 * const app = await NestFactory.create(AppModule);
 * ```
 */
@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true
      }),
  }),
    AuthModule,
    TechnicianModule,
    ClientModule,
    ServiceRequestModule,
    ServiceRequestTypeModule,
    RatingModule,
    NotificationModule,
    IdentityModule,
    ApplianceModule,
    ApplianceTypeModule,
    ApplianceBrandModule,
    ApplianceModelModule,
    AddressModule,
    HelpTicketModule],
  controllers: [],
  providers: [],
  
})
export class AppModule {}
