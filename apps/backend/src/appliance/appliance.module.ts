// src/appliance/appliance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Appliance } from './appliance.entity';
import { ApplianceService } from './appliance.service';
import { ApplianceController } from './appliance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appliance])
  ],
  providers: [
    ApplianceService
  ],
  controllers: [
    ApplianceController
  ],
  exports: [
    ApplianceService
  ]
})
export class ApplianceModule {}
