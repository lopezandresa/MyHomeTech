import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Identity } from '../identity/identity.entity';

/**
 * Servicio para la gestión de direcciones de usuario
 * 
 * @description Maneja todas las operaciones CRUD relacionadas con direcciones:
 * - Creación y validación de direcciones
 * - Gestión de direcciones principales/por defecto
 * - Actualización y eliminación
 * - Vinculación con usuarios
 * 
 * @class AddressService
 */
@Injectable()
export class AddressService {
  /**
   * Constructor del servicio de direcciones
   * 
   * @param {Repository<Address>} addressRepository - Repositorio de direcciones
   * @param {Repository<Identity>} identityRepository - Repositorio de usuarios
   */
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {}

  /**
   * Crea una nueva dirección para un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {CreateAddressDto} createAddressDto - Datos de la dirección a crear
   * @returns {Promise<Address>} Dirección creada
   * @throws {NotFoundException} Si el usuario no existe
   * 
   * @description Si es la primera dirección del usuario o se marca como default,
   * se establece automáticamente como dirección principal
   * 
   * @example
   * ```typescript
   * const address = await addressService.create(1, {
   *   street: "Calle 123 #45-67",
   *   neighborhood: "Centro",
   *   city: "Bogotá",
   *   isDefault: true
   * });
   * ```
   */
  async create(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    const user = await this.identityRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si es la primera dirección o se marca como default, hacer las validaciones
    if (createAddressDto.isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });

    const savedAddress = await this.addressRepository.save(address);

    // Si es la primera dirección del usuario, marcarla como principal automáticamente
    const userAddressCount = await this.addressRepository.count({ where: { userId } });
    if (userAddressCount === 1 || createAddressDto.isDefault) {
      await this.setPrimaryAddress(userId, savedAddress.id);
    }

    return savedAddress;
  }

  /**
   * Obtiene todas las direcciones de un usuario
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise<Address[]>} Lista de direcciones del usuario
   * 
   * @description Las direcciones se ordenan primero por isDefault (DESC) 
   * y luego por fecha de creación (ASC)
   * 
   * @example
   * ```typescript
   * const addresses = await addressService.findByUser(1);
   * ```
   */
  async findByUser(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' }
    });
  }

  /**
   * Busca una dirección específica que pertenezca al usuario
   * 
   * @param {number} id - ID de la dirección
   * @param {number} userId - ID del usuario propietario
   * @returns {Promise<Address>} Dirección encontrada
   * @throws {NotFoundException} Si la dirección no existe o no pertenece al usuario
   * 
   * @example
   * ```typescript
   * const address = await addressService.findOne(5, 1);
   * ```
   */
  async findOne(id: number, userId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId }
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return address;
  }

  /**
   * Actualiza una dirección existente del usuario
   * 
   * @param {number} id - ID de la dirección
   * @param {number} userId - ID del usuario propietario
   * @param {UpdateAddressDto} updateAddressDto - Datos a actualizar
   * @returns {Promise<Address>} Dirección actualizada
   * @throws {NotFoundException} Si la dirección no existe o no pertenece al usuario
   * 
   * @description Si se marca como default, limpia otras direcciones por defecto
   * y la establece como dirección principal del usuario
   * 
   * @example
   * ```typescript
   * const updatedAddress = await addressService.update(5, 1, {
   *   street: "Nueva Calle 456 #78-90",
   *   isDefault: true
   * });
   * ```
   */
  async update(id: number, userId: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    if (updateAddressDto.isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    Object.assign(address, updateAddressDto);
    const updatedAddress = await this.addressRepository.save(address);

    if (updateAddressDto.isDefault) {
      await this.setPrimaryAddress(userId, address.id);
    }

    return updatedAddress;
  }

  /**
   * Elimina una dirección del usuario
   * 
   * @param {number} id - ID de la dirección a eliminar
   * @param {number} userId - ID del usuario propietario
   * @returns {Promise<void>} Void cuando se complete la eliminación
   * @throws {NotFoundException} Si la dirección no existe o no pertenece al usuario
   * 
   * @description Si se elimina la dirección principal, automáticamente
   * establece otra dirección como principal o limpia la referencia
   * 
   * @example
   * ```typescript
   * await addressService.remove(5, 1);
   * ```
   */
  async remove(id: number, userId: number): Promise<void> {
    const address = await this.findOne(id, userId);
    
    // Verificar si es la dirección principal
    const user = await this.identityRepository.findOne({ where: { id: userId } });
    if (user?.primaryAddressId === id) {
      // Buscar otra dirección para establecer como principal
      const otherAddress = await this.addressRepository.findOne({
        where: { 
          userId, 
          id: Not(id) 
        },
        order: { createdAt: 'ASC' }
      });

      if (otherAddress) {
        await this.setPrimaryAddress(userId, otherAddress.id);
      } else {
        // Si no hay otras direcciones, limpiar la dirección principal
        await this.identityRepository.update(userId, { primaryAddressId: undefined });
      }
    }

    await this.addressRepository.remove(address);
  }

  /**
   * Establece una dirección como principal/por defecto para el usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {number} addressId - ID de la dirección a establecer como principal
   * @returns {Promise<void>} Void cuando se complete la operación
   * @throws {NotFoundException} Si el usuario o la dirección no existen
   * 
   * @description Limpia otras direcciones por defecto y actualiza
   * la referencia en el usuario
   * 
   * @example
   * ```typescript
   * await addressService.setPrimaryAddress(1, 5);
   * ```
   */
  async setPrimaryAddress(userId: number, addressId: number): Promise<void> {
    const user = await this.identityRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId }
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Limpiar direcciones por defecto anteriores
    await this.clearDefaultAddresses(userId);

    // Establecer nueva dirección por defecto
    await this.addressRepository.update(addressId, { isDefault: true });
    await this.identityRepository.update(userId, { primaryAddressId: addressId });
  }

  /**
   * Obtiene la dirección principal del usuario
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise<Address | null>} Dirección principal o null si no tiene
   * 
   * @example
   * ```typescript
   * const primaryAddress = await addressService.getPrimaryAddress(1);
   * if (primaryAddress) {
   *   console.log('Dirección principal:', primaryAddress.street);
   * }
   * ```
   */
  async getPrimaryAddress(userId: number): Promise<Address | null> {
    const user = await this.identityRepository.findOne({
      where: { id: userId },
      relations: ['primaryAddress']
    });

    return user?.primaryAddress || null;
  }

  /**
   * Limpia todas las direcciones marcadas como por defecto para un usuario
   * 
   * @private
   * @param {number} userId - ID del usuario
   * @returns {Promise<void>} Void cuando se complete la operación
   * 
   * @description Método interno usado antes de establecer una nueva
   * dirección por defecto
   */
  private async clearDefaultAddresses(userId: number): Promise<void> {
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }
}