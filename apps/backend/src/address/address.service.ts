import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Identity } from '../identity/identity.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {}

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

  async findByUser(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' }
    });
  }

  async findOne(id: number, userId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId }
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return address;
  }

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

  async getPrimaryAddress(userId: number): Promise<Address | null> {
    const user = await this.identityRepository.findOne({
      where: { id: userId },
      relations: ['primaryAddress']
    });

    return user?.primaryAddress || null;
  }

  private async clearDefaultAddresses(userId: number): Promise<void> {
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }
}