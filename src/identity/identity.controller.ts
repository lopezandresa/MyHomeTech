import { Controller, Post, Body, UseGuards, Get, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { Identity } from './identity.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../common/roles.decorator';

export type IdentityResponse = Omit<Identity, 'password'>;

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly svc: IdentityService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra un nuevo usuario' })
  async register(
    @Body() dto: CreateIdentityDto
  ): Promise<IdentityResponse> {
    return this.svc.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('me')
  @ApiOperation({ summary: 'Obtiene datos del usuario autenticado' })
  me(@Request() req): IdentityResponse {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios' })
  findAll(): Promise<IdentityResponse[]> {
    return this.svc.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  findById(@Param('id') id: number): Promise<IdentityResponse | null> {
    return this.svc.findById(id);
  }
}
