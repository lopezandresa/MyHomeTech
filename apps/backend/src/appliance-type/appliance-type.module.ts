import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplianceType } from './appliance-type.entity';
import { ApplianceTypeService } from './appliance-type.service';
import { ApplianceTypeController } from './appliance-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplianceType])],
  providers: [ApplianceTypeService],
  controllers: [ApplianceTypeController],
  exports: [ApplianceTypeService]
})
export class ApplianceTypeModule {}
