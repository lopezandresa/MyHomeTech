import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TechnicianModule } from './technician/technician.module';
import { ClientModule } from './client/client.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ScheduleModule } from './schedule/schedule.module';
import { RatingModule } from './rating/rating.module';
import { NotificationModule } from './notification/notification.module';
import { IdentityModule } from './identity/identity.module';
import { ApplianceModuleModule } from './appliance/appliance.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'alopez',
    database: 'myhometech',
    autoLoadEntities: true,
    synchronize: true,
  }),
    AuthModule,
    TechnicianModule,
    ClientModule,
    ServiceRequestModule,
    ScheduleModule,
    RatingModule,
    NotificationModule,
    IdentityModule,
    ApplianceModuleModule],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
