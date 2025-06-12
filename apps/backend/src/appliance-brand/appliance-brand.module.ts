import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplianceBrand } from './appliance-brand.entity';
import { ApplianceBrandService } from './appliance-brand.service';
import { ApplianceBrandController } from './appliance-brand.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplianceBrand])],
  providers: [ApplianceBrandService],
  controllers: [ApplianceBrandController],
  exports: [ApplianceBrandService]
})
export class ApplianceBrandModule {}
