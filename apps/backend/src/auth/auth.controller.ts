import { Body, Controller, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Obtiene un JWT a partir de credenciales' })
  async login(@Body() dto: LoginDto) {
    // Validar las credenciales y estado del usuario
    const validationResult = await this.authService.validateUser(dto.email, dto.password);
    
    // Si hay error en la validación, devolver el resultado con error
    if (validationResult.hasError) {
      return validationResult;
    }
    
    // Si la validación es exitosa, generar el token
    const tokenResult = await this.authService.login(validationResult.user);
    
    // Devolver respuesta exitosa con el token
    return {
      hasError: false,
      message: 'Inicio de sesión exitoso',
      ...tokenResult
    };
  }

  @Post('logout')
  async logout(@Request() req) {
    // En JWT stateless, el logout es responsabilidad del cliente (borrar token)
    // Aquí solo retornamos un mensaje estándar
    return { message: 'Sesión cerrada. Elimina el token en el cliente.' };
  }
}