import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Address } from './address.entity';
import { Identity } from '../identity/identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Identity])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}