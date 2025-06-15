import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IdentityService } from 'src/identity/identity.service';

/**
 * Servicio de autenticación JWT
 *
 * @description Maneja la autenticación de usuarios mediante JWT:
 * - Validación de credenciales (email/contraseña)
 * - Generación de tokens JWT
 * - Verificación de contraseñas con bcrypt
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  /**
   * Constructor del servicio de autenticación
   *
   * @param {IdentityService} userService - Servicio de gestión de usuarios
   * @param {JwtService} jwtService - Servicio JWT de NestJS
   */
  constructor(
    private readonly userService: IdentityService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales del usuario
   *
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<{hasError: boolean, codeError?: string, message?: string, user?: any}>} Resultado de la validación
   *
   * @description Busca al usuario por email, verifica que esté activo y compara la contraseña
   * usando bcrypt. Devuelve un objeto estructurado con el resultado de la validación
   *
   * @example
   * ```typescript
   * const result = await authService.validateUser('user@example.com', 'password123');
   * if (!result.hasError) {
   *   console.log('Usuario válido:', result.user.email);
   * } else {
   *   console.log('Error:', result.message);
   * }
   * ```
   */
  async validateUser(email: string, password: string) {
    // Buscar usuario sin lanzar excepción
    let user;
    try {
      user = await this.userService.findByEmail(email);
    } catch (error) {
      // Si no se encuentra el usuario, devolver error estructurado
      return {
        hasError: true,
        codeError: 'USER_NOT_FOUND',
        message: 'Credenciales inválidas'
      };
    }
    
    // Verificar que la contraseña es correcta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        hasError: true,
        codeError: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      };
    }
    
    // Verificar que el usuario esté activo
    if (!user.status) {
      return {
        hasError: true,
        codeError: 'USER_INACTIVE',
        message: 'Tu cuenta ha sido desactivada. Por favor, contacta al administrador para más información.'
      };
    }
    
    // Usuario válido, excluir la contraseña del resultado
    const { password: userPassword, ...result } = user;
    return {
      hasError: false,
      user: result
    };
  }

  /**
   * Genera un token JWT para el usuario autenticado
   *
   * @param {any} user - Usuario autenticado (objeto con email, id, role)
   * @returns {Promise<{access_token: string}>} Objeto con el token JWT
   *
   * @description Crea un payload con email, sub (id) y role del usuario,
   * luego genera y firma el token JWT
   *
   * @example
   * ```typescript
   * const loginResult = await authService.login({
   *   email: 'user@example.com',
   *   id: 123,
   *   role: 'client'
   * });
   * console.log('Token:', loginResult.access_token);
   * ```
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}