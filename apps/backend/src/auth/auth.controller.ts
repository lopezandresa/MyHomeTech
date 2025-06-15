/**
 * @fileoverview Controlador de autenticación para la aplicación MyHomeTech
 * 
 * @description Maneja todas las operaciones relacionadas con autenticación:
 * - Login de usuarios con validación de credenciales
 * - Logout con instrucciones para manejo de tokens JWT
 * - Generación y validación de tokens JWT
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

import { Body, Controller, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

/**
 * Controlador para operaciones de autenticación
 * 
 * @description Expone endpoints para login y logout de usuarios
 * con soporte para JWT stateless y validación de credenciales
 * 
 * @example
 * ```typescript
 * POST /api/auth/login
 * POST /api/auth/logout
 * ```
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Constructor del controlador de autenticación
   * 
   * @param {AuthService} authService - Servicio de autenticación inyectado
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para autenticar usuarios y generar token JWT
   * 
   * @description Valida las credenciales del usuario y genera un token JWT
   * si las credenciales son correctas. Maneja diferentes tipos de usuarios
   * (cliente, técnico, admin) y sus estados específicos
   * 
   * @param {LoginDto} dto - Credenciales de login (email y password)
   * @returns {Promise<object>} Objeto con resultado de autenticación y token JWT
   * 
   * @example
   * ```typescript
   * // Ejemplo de uso
   * const response = await fetch('/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     email: 'usuario@example.com',
   *     password: 'miPassword123'
   *   })
   * });
   * ```
   */
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

  /**
   * Endpoint para cerrar sesión del usuario
   * 
   * @description Como se usa JWT stateless, el logout es manejado por el cliente
   * eliminando el token. Este endpoint retorna instrucciones para el cliente
   * 
   * @param {Request} req - Objeto de request de Express
   * @returns {Promise<object>} Mensaje con instrucciones de logout
   * 
   * @example
   * ```typescript
   * // El cliente debe eliminar el token después del logout
   * localStorage.removeItem('token');
   * // o
   * sessionStorage.removeItem('token');
   * ```
   */
  @Post('logout')
  async logout(@Request() req) {
    // En JWT stateless, el logout es responsabilidad del cliente (borrar token)
    // Aquí solo retornamos un mensaje estándar
    return { message: 'Sesión cerrada. Elimina el token en el cliente.' };
  }
}