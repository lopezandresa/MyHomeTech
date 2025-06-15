import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { In, Repository } from 'typeorm';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { ApplianceType } from '../appliance-type/appliance-type.entity';

/**
 * Servicio para la gestión de perfiles de técnicos
 * 
 * @description Maneja todas las operaciones relacionadas con técnicos:
 * - Creación y actualización de perfiles
 * - Gestión de especialidades técnicas
 * - Consulta de técnicos por ID o identidad
 * - Administración de experiencia y certificaciones
 * 
 * @class TechnicianService
 */
@Injectable()
export class TechnicianService {
  /**
   * Constructor del servicio de técnicos
   * 
   * @param {Repository<Technician>} techRepo - Repositorio de técnicos
   * @param {Repository<ApplianceType>} appTypeRepo - Repositorio de tipos de electrodomésticos
   */
  constructor(
    @InjectRepository(Technician)
    private readonly techRepo: Repository<Technician>,
    @InjectRepository(ApplianceType)
    private readonly appTypeRepo: Repository<ApplianceType>,
  ) {}

  /**
   * Crea un perfil completo de técnico con especialidades
   * 
   * @param {CreateTechnicianProfileDto} dto - Datos del perfil del técnico
   * @returns {Promise<Technician>} Perfil de técnico creado
   * 
   * @description Crea un perfil de técnico incluyendo:
   * - Información personal (cédula, fecha de nacimiento)
   * - Experiencia laboral
   * - Foto de identificación
   * - Especialidades técnicas (tipos de electrodomésticos)
   * 
   * @example
   * ```typescript
   * const technicianProfile = await technicianService.createProfile({
   *   identityId: 123,
   *   cedula: '12345678',
   *   birthDate: '1990-05-15',
   *   experienceYears: 5,
   *   idPhotoPath: '/uploads/id-photos/tech-123.jpg',
   *   specialties: [1, 2, 3] // IDs de tipos: refrigeradores, lavadoras, aires
   * });
   * ```
   */
  async createProfile(dto: CreateTechnicianProfileDto): Promise<Technician> {
    // pre-carga las entidades de tipos de electrodomésticos
    const specialties = await this.appTypeRepo.find({
      where: { id: In(dto.specialties) }
    });
    const tech = this.techRepo.create({
      identityId: dto.identityId,
      cedula: dto.cedula,
      birthDate: new Date(dto.birthDate),
      experienceYears: dto.experienceYears,
      idPhotoPath: dto.idPhotoPath,
      specialties: specialties,
    });
    return this.techRepo.save(tech);
  }

  /**
   * Obtiene todos los técnicos registrados en el sistema
   * 
   * @returns {Promise<Technician[]>} Lista de todos los técnicos con especialidades
   * 
   * @description Incluye las especialidades de cada técnico para mostrar
   * sus capacidades técnicas
   * 
   * @example
   * ```typescript
   * const allTechnicians = await technicianService.findAll();
   * console.log(`Hay ${allTechnicians.length} técnicos registrados`);
   * ```
   */
  findAll(): Promise<Technician[]> {
    return this.techRepo.find({ relations: ['specialties'] });
  }
  
  /**
   * Busca un técnico por su ID interno
   * 
   * @param {number} id - ID interno del técnico
   * @returns {Promise<Technician | null>} Técnico encontrado o null
   * 
   * @description Incluye las especialidades del técnico en el resultado
   * 
   * @example
   * ```typescript
   * const technician = await technicianService.findById(456);
   * if (technician) {
   *   console.log('Especialidades:', technician.specialties.map(s => s.name));
   * }
   * ```
   */
  findById(id: number): Promise<Technician | null> {
    return this.techRepo.findOne({ 
      where: { id },
      relations: ['specialties'] 
    });
  }

  /**
   * Busca un técnico por su ID de identidad (usuario)
   * 
   * @param {number} identityId - ID del usuario en la tabla Identity
   * @returns {Promise<Technician | null>} Técnico encontrado o null
   * 
   * @description Método principal para obtener el perfil de técnico
   * a partir del usuario autenticado
   * 
   * @example
   * ```typescript
   * const technician = await technicianService.findByIdentityId(req.user.id);
   * if (technician) {
   *   console.log('Años de experiencia:', technician.experienceYears);
   * }
   * ```
   */
  findByIdentityId(identityId: number): Promise<Technician | null> {
    return this.techRepo.findOne({ 
      where: { identityId },
      relations: ['specialties']
    });
  }

  /**
   * Actualiza campos específicos del perfil de técnico
   * 
   * @param {number} identityId - ID del usuario
   * @param {Partial<Technician>} profile - Campos a actualizar
   * @returns {Promise<Technician>} Perfil actualizado
   * @throws {Error} Si el perfil de técnico no existe
   * 
   * @description Actualización parcial de campos básicos del perfil
   * 
   * @example
   * ```typescript
   * const updatedTech = await technicianService.updateProfileByIdentityId(123, {
   *   experienceYears: 6,
   *   idPhotoPath: '/uploads/new-photo.jpg'
   * });
   * ```
   */
  async updateProfileByIdentityId(identityId: number, profile: Partial<Technician>): Promise<Technician> {
    const tech = await this.techRepo.findOne({ where: { identityId } });
    if (!tech) throw new Error('Perfil de técnico no encontrado');
    Object.assign(tech, profile);
    return this.techRepo.save(tech);
  }

  /**
   * Actualiza completamente el perfil del técnico incluyendo especialidades
   * 
   * @param {number} identityId - ID del usuario
   * @param {Partial<CreateTechnicianProfileDto>} dto - Datos a actualizar
   * @returns {Promise<Technician>} Perfil completamente actualizado
   * @throws {NotFoundException} Si el perfil de técnico no existe
   * 
   * @description Permite actualizar todos los campos del perfil,
   * incluyendo especialidades técnicas
   * 
   * @example
   * ```typescript
   * const updatedProfile = await technicianService.updateFullProfile(123, {
   *   experienceYears: 7,
   *   specialties: [1, 2, 4], // Cambiar especialidades
   *   cedula: '87654321'
   * });
   * ```
   */
  async updateFullProfile(identityId: number, dto: Partial<CreateTechnicianProfileDto>): Promise<Technician> {
    const tech = await this.techRepo.findOne({ 
      where: { identityId },
      relations: ['specialties']
    });
    if (!tech) throw new NotFoundException('Perfil de técnico no encontrado');

    // Actualizar campos básicos
    if (dto.cedula) tech.cedula = dto.cedula;
    if (dto.birthDate) tech.birthDate = new Date(dto.birthDate);
    if (dto.experienceYears !== undefined) tech.experienceYears = dto.experienceYears;
    if (dto.idPhotoPath) tech.idPhotoPath = dto.idPhotoPath;

    // Actualizar especialidades si se proporcionan
    if (dto.specialties && dto.specialties.length > 0) {
      const specialties = await this.appTypeRepo.find({
        where: { id: In(dto.specialties) }
      });
      tech.specialties = specialties;
    }

    return this.techRepo.save(tech);
  }

  /**
   * Agrega una nueva especialidad al técnico
   * 
   * @param {number} technicianId - ID interno del técnico
   * @param {number} specialtyId - ID del tipo de electrodoméstico
   * @returns {Promise<Technician>} Técnico con especialidad agregada
   * @throws {NotFoundException} Si el técnico o especialidad no existen
   * 
   * @description Añade una especialidad si el técnico no la tiene ya.
   * Evita duplicados automáticamente.
   * 
   * @example
   * ```typescript
   * const techWithNewSpecialty = await technicianService.addSpecialty(456, 5);
   * console.log('Nueva especialidad agregada');
   * ```
   */
  async addSpecialty(technicianId: number, specialtyId: number): Promise<Technician> {
    const tech = await this.techRepo.findOne({ 
      where: { id: technicianId },
      relations: ['specialties']
    });
    if (!tech) throw new NotFoundException('Técnico no encontrado');

    const specialty = await this.appTypeRepo.findOne({ where: { id: specialtyId } });
    if (!specialty) throw new NotFoundException('Tipo de electrodoméstico no encontrado');

    // Verificar si ya tiene esta especialidad
    const hasSpecialty = tech.specialties.some(s => s.id === specialtyId);
    if (!hasSpecialty) {
      tech.specialties.push(specialty);
      return this.techRepo.save(tech);
    }

    return tech;
  }

  /**
   * Remueve una especialidad específica del técnico
   * 
   * @param {number} technicianId - ID interno del técnico
   * @param {number} specialtyId - ID del tipo de electrodoméstico a remover
   * @returns {Promise<Technician>} Técnico con especialidad removida
   * @throws {NotFoundException} Si el técnico no existe
   * 
   * @description Elimina una especialidad de la lista del técnico.
   * No genera error si la especialidad no existía.
   * 
   * @example
   * ```typescript
   * const techWithoutSpecialty = await technicianService.removeSpecialty(456, 5);
   * console.log('Especialidad removida');
   * ```
   */
  async removeSpecialty(technicianId: number, specialtyId: number): Promise<Technician> {
    const tech = await this.techRepo.findOne({ 
      where: { id: technicianId },
      relations: ['specialties']
    });
    if (!tech) throw new NotFoundException('Técnico no encontrado');

    tech.specialties = tech.specialties.filter(s => s.id !== specialtyId);
    return this.techRepo.save(tech);
  }
}