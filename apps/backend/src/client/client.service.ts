import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';

/**
 * Servicio para la gestión de perfiles de clientes
 *
 * @description Maneja todas las operaciones relacionadas con clientes:
 * - Creación y actualización de perfiles de cliente
 * - Consulta de clientes por ID o identidad
 * - Gestión de información personal y contacto
 * - Vinculación con el sistema de usuarios
 *
 * @class ClientService
 */
@Injectable()
export class ClientService {
  /**
   * Constructor del servicio de clientes
   *
   * @param {Repository<Client>} clientRepo - Repositorio de clientes
   */
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  /**
   * Crea un perfil completo de cliente
   *
   * @param {CreateClientProfileDto} dto - Datos del perfil del cliente
   * @returns {Promise<Client>} Perfil de cliente creado
   *
   * @description Crea un perfil de cliente con información personal:
   * - Nombre completo
   * - Cédula de identidad
   * - Fecha de nacimiento
   * - Teléfono de contacto
   * - Vinculación con usuario del sistema
   *
   * @example
   * ```typescript
   * const clientProfile = await clientService.createProfile({
   *   identityId: 123,
   *   fullName: 'Juan Pérez García',
   *   cedula: '12345678',
   *   birthDate: '1985-03-20',
   *   phone: '+57 300 123 4567'
   * });
   * ```
   */
  async createProfile(dto: CreateClientProfileDto): Promise<Client> {
    const client = this.clientRepo.create({
      identityId: dto.identityId,
      fullName: dto.fullName,
      cedula: dto.cedula,
      birthDate: new Date(dto.birthDate),
      phone: dto.phone,
    });
    return this.clientRepo.save(client);
  }

  /**
   * Obtiene todos los clientes registrados en el sistema
   *
   * @returns {Promise<Client[]>} Lista de todos los clientes
   *
   * @description Retorna la lista completa de clientes para
   * propósitos administrativos o estadísticas
   *
   * @example
   * ```typescript
   * const allClients = await clientService.findAll();
   * console.log(`Total de clientes registrados: ${allClients.length}`);
   * ```
   */
  findAll(): Promise<Client[]> {
    return this.clientRepo.find();
  }

  /**
   * Busca un cliente por su ID interno
   *
   * @param {number} id - ID interno del cliente
   * @returns {Promise<Client | null>} Cliente encontrado o null
   *
   * @description Búsqueda directa por clave primaria del cliente
   *
   * @example
   * ```typescript
   * const client = await clientService.findById(456);
   * if (client) {
   *   console.log('Cliente encontrado:', client.fullName);
   * }
   * ```
   */
  findById(id: number): Promise<Client | null> {
    return this.clientRepo.findOne({ where: { id } });
  }

  /**
   * Busca un cliente por su ID de identidad (usuario)
   *
   * @param {number} identityId - ID del usuario en la tabla Identity
   * @returns {Promise<Client | null>} Cliente encontrado o null
   *
   * @description Método principal para obtener el perfil de cliente
   * a partir del usuario autenticado
   *
   * @example
   * ```typescript
   * const client = await clientService.findByIdentityId(req.user.id);
   * if (client) {
   *   console.log('Bienvenido:', client.fullName);
   * }
   * ```
   */
  findByIdentityId(identityId: number): Promise<Client | null> {
    return this.clientRepo.findOne({ where: { identityId } });
  }

  /**
   * Actualiza el perfil de un cliente específico
   *
   * @param {number} identityId - ID del usuario
   * @param {Partial<Client>} profile - Campos a actualizar
   * @returns {Promise<Client>} Perfil de cliente actualizado
   * @throws {NotFoundException} Si el perfil de cliente no existe
   *
   * @description Permite actualizar información personal del cliente
   * como nombre, teléfono, etc.
   *
   * @example
   * ```typescript
   * const updatedClient = await clientService.updateProfileByIdentityId(123, {
   *   fullName: 'Juan Pérez Martínez',
   *   phone: '+57 310 987 6543'
   * });
   * console.log('Perfil actualizado:', updatedClient.fullName);
   * ```
   */
  async updateProfileByIdentityId(identityId: number, profile: Partial<Client>): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { identityId } });
    if (!client) throw new NotFoundException('Perfil de cliente no encontrado');
    Object.assign(client, profile);
    return this.clientRepo.save(client);
  }
}