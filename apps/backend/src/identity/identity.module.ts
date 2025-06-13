import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './identity.entity';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { PassportModule } from '@nestjs/passport';
import { CloudinaryService } from '../common/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Identity]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [IdentityService, CloudinaryService],
  controllers: [IdentityController],
  exports: [IdentityService],
})
export class IdentityModule {}