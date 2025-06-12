import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplianceModel } from './appliance-model.entity';
import { ApplianceModelService } from './appliance-model.service';
import { ApplianceModelController } from './appliance-model.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplianceModel])],
  providers: [ApplianceModelService],
  controllers: [ApplianceModelController],
  exports: [ApplianceModelService]
})
export class ApplianceModelModule {}
