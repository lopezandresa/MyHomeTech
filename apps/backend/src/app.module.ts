import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TechnicianModule } from './technician/technician.module';
import { ClientModule } from './client/client.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { RatingModule } from './rating/rating.module';
import { NotificationModule } from './notification/notification.module';
import { IdentityModule } from './identity/identity.module';
import { ApplianceModule } from './appliance/appliance.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    RatingModule,
    NotificationModule,
    IdentityModule,
    ApplianceModule],
  controllers: [],
  providers: [],
  
})
export class AppModule {}
