import { Injectable, UnauthorizedException } from '@nestjs/common';
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
   * @returns {Promise<any>} Usuario sin contraseña si las credenciales son válidas
   * @throws {UnauthorizedException} Si las credenciales son inválidas
   *
   * @description Busca al usuario por email y compara la contraseña
   * usando bcrypt. Excluye la contraseña del resultado
   *
   * @example
   * ```typescript
   * try {
   *   const user = await authService.validateUser('user@example.com', 'password123');
   *   console.log('Usuario válido:', user.email);
   * } catch (error) {
   *   console.log('Credenciales inválidas');
   * }
   * ```
   */
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
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