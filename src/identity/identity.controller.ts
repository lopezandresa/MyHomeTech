import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Identity } from './identity.entity';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra un nuevo usuario con rol' })
  async register(@Body() dto: CreateIdentityDto): Promise<Omit<Identity,'password'>> {
    const i = await this.identityService.create(dto);
    const { password, ...rest } = i;
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Obtiene datos del usuario autenticado' })
  me(@Request() req): Omit<Identity,'password'> {
    const { password, ...rest } = req.user;
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios' })
  findAll(): Promise<Identity[]> {
    return this.identityService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  findById(@Param('id') id: number): Promise<Identity | null> {
    return this.identityService.findById(id);
  }
}