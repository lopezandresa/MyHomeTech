/**
 * @fileoverview Definiciones de tipos TypeScript para MyHomeTech Frontend
 * 
 * @description Contiene todas las interfaces, tipos y constantes utilizadas en la aplicación:
 * - Interfaces de usuario y autenticación
 * - Tipos de servicios y solicitudes
 * - Interfaces de direcciones y perfiles
 * - Tipos de sistema de ayuda y tickets
 * - Interfaces de administración
 * - Constantes de estado y enumeraciones
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Interface principal de usuario del sistema
 * 
 * @interface User
 * @property {number} id - Identificador único del usuario
 * @property {string} firstName - Primer nombre
 * @property {string} [middleName] - Segundo nombre (opcional)
 * @property {string} firstLastName - Primer apellido
 * @property {string} [secondLastName] - Segundo apellido (opcional)
 * @property {string} email - Correo electrónico único
 * @property {'client' | 'technician' | 'admin'} role - Rol del usuario en el sistema
 * @property {boolean} status - Estado activo/inactivo del usuario
 * @property {string} [profilePhotoUrl] - URL de la foto de perfil (Cloudinary)
 * @property {string} [profilePhotoPublicId] - ID público de Cloudinary para la foto
 * @property {string} [fullName] - Nombre completo calculado (compatibilidad)
 * @property {string} [name] - Alias para nombre (compatibilidad)
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: 1,
 *   firstName: 'Juan',
 *   firstLastName: 'Pérez',
 *   email: 'juan@example.com',
 *   role: 'client',
 *   status: true
 * };
 * ```
 */
export interface User {
  id: number
  firstName: string
  middleName?: string
  firstLastName: string
  secondLastName?: string
  email: string
  role: 'client' | 'technician' | 'admin'
  status: boolean
  profilePhotoUrl?: string
  profilePhotoPublicId?: string
  // Campo calculado para compatibilidad
  fullName?: string
  // Agregar propiedad name para compatibilidad
  name?: string
}

/**
 * Interface para credenciales de login
 * 
 * @interface LoginRequest
 * @property {string} email - Correo electrónico del usuario
 * @property {string} password - Contraseña en texto plano
 * 
 * @example
 * ```typescript
 * const loginData: LoginRequest = {
 *   email: 'usuario@example.com',
 *   password: 'miPassword123'
 * };
 * ```
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Interface para datos de registro de nuevo usuario
 * 
 * @interface RegisterRequest
 * @property {string} firstName - Primer nombre
 * @property {string} [middleName] - Segundo nombre (opcional)
 * @property {string} firstLastName - Primer apellido
 * @property {string} [secondLastName] - Segundo apellido (opcional)
 * @property {string} email - Correo electrónico único
 * @property {string} password - Contraseña (mínimo 6 caracteres)
 * @property {'client' | 'technician'} role - Rol del usuario (cliente o técnico)
 * 
 * @example
 * ```typescript
 * const registerData: RegisterRequest = {
 *   firstName: 'María',
 *   firstLastName: 'García',
 *   email: 'maria@example.com',
 *   password: 'password123',
 *   role: 'client'
 * };
 * ```
 */
export interface RegisterRequest {
  firstName: string
  middleName?: string
  firstLastName: string
  secondLastName?: string
  email: string
  password: string
  role: 'client' | 'technician'
}

/**
 * Interface para respuesta de autenticación del servidor
 * 
 * @interface AuthResponse
 * @property {string} access_token - Token JWT para autenticación
 * @property {User} User - Datos del usuario autenticado
 */
export interface AuthResponse {
  access_token: string
  User: User
}

/**
 * Interface para actualización de perfil de usuario
 * 
 * @interface UpdateProfileRequest
 * @property {string} [firstName] - Nuevo primer nombre (opcional)
 * @property {string} [middleName] - Nuevo segundo nombre (opcional)
 * @property {string} [firstLastName] - Nuevo primer apellido (opcional)
 * @property {string} [secondLastName] - Nuevo segundo apellido (opcional)
 * @property {string} [email] - Nuevo correo electrónico (opcional)
 * @property {string} [password] - Nueva contraseña (opcional)
 * 
 * @example
 * ```typescript
 * const updateData: UpdateProfileRequest = {
 *   firstName: 'Juan Carlos',
 *   email: 'nuevo@example.com'
 * };
 * ```
 */
export interface UpdateProfileRequest {
  firstName?: string
  middleName?: string
  firstLastName?: string
  secondLastName?: string
  email?: string
  password?: string
}

/**
 * Interface extendida para perfil de cliente
 * 
 * @interface ClientProfile
 * @property {number} id - ID del perfil de cliente
 * @property {number} identityId - ID del usuario base
 * @property {string} fullName - Nombre completo
 * @property {string} cedula - Número de cédula
 * @property {string} birthDate - Fecha de nacimiento (ISO string)
 * @property {string} phone - Número de teléfono
 * @property {User} identity - Datos del usuario base
 */
export interface ClientProfile {
  id: number
  identityId: number
  fullName: string
  cedula: string
  birthDate: string
  phone: string
  identity: User
}

/**
 * Interface para crear perfil de cliente
 * 
 * @interface CreateClientProfileRequest
 * @property {number} identityId - ID del usuario base
 * @property {string} fullName - Nombre completo
 * @property {string} cedula - Número de cédula único
 * @property {string} birthDate - Fecha de nacimiento
 * @property {string} phone - Número de teléfono
 */
export interface CreateClientProfileRequest {
  identityId: number
  fullName: string
  cedula: string
  birthDate: string
  phone: string
}

/**
 * Interface para electrodomésticos del catálogo
 * 
 * @interface Appliance
 * @property {number} id - ID único del electrodoméstico
 * @property {string} type - Tipo de electrodoméstico (lavadora, nevera, etc.)
 * @property {string} brand - Marca del electrodoméstico
 * @property {string} model - Modelo específico
 * @property {string} name - Nombre descriptivo completo
 * @property {boolean} isActive - Estado activo/inactivo del electrodoméstico
 * 
 * @example
 * ```typescript
 * const appliance: Appliance = {
 *   id: 1,
 *   type: 'Lavadora',
 *   brand: 'LG',
 *   model: 'WM2050CW',
 *   name: 'Lavadora LG WM2050CW',
 *   isActive: true
 * };
 * ```
 */
export interface Appliance {
  id: number
  type: string
  brand: string
  model: string
  name: string
  isActive: boolean
}

/**
 * Interface para tipos de electrodomésticos
 * 
 * @interface ApplianceType
 * @property {number} id - ID único del tipo
 * @property {string} name - Nombre del tipo (ej: "Lavadora", "Refrigerador")
 * @property {string} [description] - Descripción opcional del tipo
 * @property {boolean} isActive - Estado activo/inactivo
 */
export interface ApplianceType {
  id: number
  name: string
  description?: string
  isActive: boolean
}

/**
 * Interface para marcas de electrodomésticos
 * 
 * @interface ApplianceBrand
 * @property {number} id - ID único de la marca
 * @property {string} name - Nombre de la marca
 * @property {number} typeId - ID del tipo de electrodoméstico asociado
 * @property {boolean} isActive - Estado activo/inactivo
 * @property {ApplianceType} [type] - Tipo de electrodoméstico (relación)
 */
export interface ApplianceBrand {
  id: number
  name: string
  typeId: number
  isActive: boolean
  type?: ApplianceType
}

/**
 * Interface para modelos de electrodomésticos
 * 
 * @interface ApplianceModel
 * @property {number} id - ID único del modelo
 * @property {string} name - Nombre del modelo
 * @property {string} [description] - Descripción opcional del modelo
 * @property {number} brandId - ID de la marca asociada
 * @property {boolean} isActive - Estado activo/inactivo
 * @property {ApplianceBrand} [brand] - Marca del electrodoméstico (relación)
 */
export interface ApplianceModel {
  id: number
  name: string
  description?: string
  brandId: number
  isActive: boolean
  brand?: ApplianceBrand
}

/**
 * Interface extendida para perfil de técnico
 * 
 * @interface TechnicianProfile
 * @property {number} id - ID del perfil de técnico
 * @property {number} identityId - ID del usuario base
 * @property {string} cedula - Número de cédula
 * @property {string} birthDate - Fecha de nacimiento
 * @property {number} experienceYears - Años de experiencia
 * @property {string} idPhotoUrl - URL de la foto de identificación
 * @property {string} idPhotoPublicId - ID público de Cloudinary para foto ID
 * @property {ApplianceType[]} specialties - Especialidades del técnico
 */
export interface TechnicianProfile {
  id: number
  identityId: number
  cedula: string
  birthDate: string
  experienceYears: number
  idPhotoUrl: string
  idPhotoPublicId: string
  specialties: ApplianceType[]
}

/**
 * Interface para crear perfil de técnico
 * 
 * @interface CreateTechnicianProfileRequest
 * @property {number} identityId - ID del usuario base
 * @property {string} cedula - Número de cédula único
 * @property {string} birthDate - Fecha de nacimiento
 * @property {number} experienceYears - Años de experiencia laboral
 * @property {number[]} specialties - IDs de tipos de electrodomésticos especializados
 * @property {File} [idPhotoFile] - Archivo de foto de identificación (opcional)
 */
export interface CreateTechnicianProfileRequest {
  identityId: number
  cedula: string
  birthDate: string
  experienceYears: number
  specialties: number[]
  idPhotoFile?: File
}

/**
 * Constantes para tipos de servicio disponibles
 * 
 * @constant
 * @type {object}
 * @property {string} MAINTENANCE - Mantenimiento preventivo
 * @property {string} INSTALLATION - Instalación de equipos nuevos
 * @property {string} REPAIR - Reparación o arreglo de fallas
 * 
 * @example
 * ```typescript
 * const serviceType = ServiceType.REPAIR; // 'repair'
 * ```
 */
export const ServiceType = {
  MAINTENANCE: 'maintenance',   // Mantenimiento preventivo
  INSTALLATION: 'installation', // Instalación de equipos
  REPAIR: 'repair',             // Reparación/arreglo
} as const

/**
 * Tipo derivado de las constantes de ServiceType
 * 
 * @typedef {string} ServiceType
 */
export type ServiceType = typeof ServiceType[keyof typeof ServiceType]

/**
 * Interface principal para solicitudes de servicio
 * 
 * @interface ServiceRequest
 * @property {number} id - ID único de la solicitud
 * @property {number} clientId - ID del cliente que solicita
 * @property {number} [technicianId] - ID del técnico asignado (opcional)
 * @property {number} applianceId - ID del electrodoméstico a reparar
 * @property {string} description - Descripción del problema o servicio
 * @property {ServiceType} serviceType - Tipo de servicio solicitado
 * @property {'pending' | 'scheduled' | 'completed' | 'cancelled'} status - Estado actual
 * @property {string} proposedDateTime - Fecha y hora propuesta por el cliente
 * @property {string} [scheduledAt] - Fecha y hora programada (opcional)
 * @property {string} [completedAt] - Fecha y hora de finalización (opcional)
 * @property {string} [cancelledAt] - Fecha y hora de cancelación (opcional)
 * @property {string} [cancellationReason] - Motivo de cancelación (opcional)
 * @property {number} [cancelledByUserId] - ID del usuario que canceló (opcional)
 * @property {string} [cancellationTicketCreatedAt] - Fecha de creación del ticket de cancelación (opcional)
 * @property {AlternativeDateProposal[]} [alternativeDateProposals] - Propuestas de fechas alternativas (opcional)
 * @property {User} client - Datos del cliente
 * @property {User} [technician] - Datos del técnico asignado (opcional)
 * @property {Appliance} appliance - Datos del electrodoméstico
 * @property {Address} address - Dirección donde se realizará el servicio
 * @property {User} [cancelledByUser] - Usuario que canceló la solicitud (opcional)
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de última actualización
 * 
 * @example
 * ```typescript
 * const request: ServiceRequest = {
 *   id: 1,
 *   clientId: 123,
 *   applianceId: 456,
 *   description: 'La lavadora no enciende',
 *   serviceType: ServiceType.REPAIR,
 *   status: 'pending',
 *   proposedDateTime: '2024-12-20T10:00:00Z',
 *   // ...other properties
 * };
 * ```
 */
export interface ServiceRequest {
  id: number
  clientId: number
  technicianId?: number
  applianceId: number
  description: string
  serviceType: ServiceType // Cambiado de problemType a serviceType
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled'
  proposedDateTime: string
  scheduledAt?: string
  completedAt?: string
  cancelledAt?: string
  // Información del ticket de cancelación
  cancellationReason?: string
  cancelledByUserId?: number
  cancellationTicketCreatedAt?: string
  // Nueva propiedad para propuestas de fechas alternativas
  alternativeDateProposals?: AlternativeDateProposal[]
  // Relaciones
  client: User
  technician?: User
  appliance: Appliance
  address: Address
  cancelledByUser?: User
  createdAt: string
  updatedAt: string
}

/**
 * Interface para crear nueva solicitud de servicio
 * 
 * @interface CreateServiceRequestRequest
 * @property {number} applianceId - ID del electrodoméstico
 * @property {number} addressId - ID de la dirección de servicio
 * @property {string} description - Descripción del problema
 * @property {ServiceType} [serviceType] - Tipo de servicio (por defecto REPAIR)
 * @property {number} clientPrice - Precio que el cliente está dispuesto a pagar
 * @property {string} proposedDateTime - Fecha y hora propuesta (ISO string)
 * @property {number} [validHours] - Horas de validez de la oferta (por defecto 24)
 * 
 * @example
 * ```typescript
 * const newRequest: CreateServiceRequestRequest = {
 *   applianceId: 1,
 *   addressId: 2,
 *   description: 'Refrigerador no enfría',
 *   proposedDateTime: '2024-12-21T09:00:00Z',
 *   clientPrice: 150000
 * };
 * ```
 */
export interface CreateServiceRequestRequest {
  applianceId: number
  addressId: number
  description: string
  serviceType?: ServiceType // Nuevo campo opcional, por defecto REPAIR
  clientPrice: number // Precio que el cliente está dispuesto a pagar
  proposedDateTime: string // Nueva: fecha y hora propuesta
  validHours?: number // Tiempo de validez en horas, por defecto 24 horas
}

/**
 * Interface para aceptar una solicitud de servicio
 * 
 * @interface AcceptRequestRequest
 * @property {boolean} acceptClientPrice - Acepta el precio propuesto por el cliente
 */
export interface AcceptRequestRequest {
  acceptClientPrice: boolean
}

/**
 * Interface para programar una solicitud de servicio
 * 
 * @interface ScheduleRequestRequest
 * @property {string} scheduledAt - Fecha y hora programadas para el servicio
 */
export interface ScheduleRequestRequest {
  scheduledAt: string
}

/**
 * Interface para direcciones de servicio
 * 
 * @interface Address
 * @property {number} id - ID único de la dirección
 * @property {string} street - Nombre de la calle
 * @property {string} number - Número de la casa/edificio
 * @property {string} [apartment] - Número de apartamento (opcional)
 * @property {string} neighborhood - Barrio o localidad
 * @property {string} city - Ciudad
 * @property {string} state - Departamento o estado
 * @property {string} postalCode - Código postal
 * @property {string} country - País
 * @property {string} [additionalInfo] - Información adicional (opcional)
 * @property {boolean} isDefault - Si es la dirección principal del usuario
 * @property {number} userId - ID del usuario propietario
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de actualización
 * @property {string} fullAddress - Dirección completa formateada
 * 
 * @example
 * ```typescript
 * const address: Address = {
 *   id: 1,
 *   street: 'Calle 123',
 *   number: '45-67',
 *   neighborhood: 'Centro',
 *   city: 'Bogotá',
 *   state: 'Cundinamarca',
 *   postalCode: '110111',
 *   country: 'Colombia',
 *   isDefault: true,
 *   userId: 123,
 *   fullAddress: 'Calle 123 #45-67, Centro, Bogotá'
 * };
 * ```
 */
export interface Address {
  id: number
  street: string
  number: string
  apartment?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  additionalInfo?: string
  isDefault: boolean
  userId: number
  createdAt: string
  updatedAt: string
  fullAddress: string
}

/**
 * Interface para crear nueva dirección
 * 
 * @interface CreateAddressRequest
 * @property {string} street - Nombre de la calle
 * @property {string} number - Número de la casa/edificio
 * @property {string} [apartment] - Número de apartamento (opcional)
 * @property {string} neighborhood - Barrio o localidad
 * @property {string} city - Ciudad
 * @property {string} state - Departamento o estado
 * @property {string} postalCode - Código postal
 * @property {string} country - País
 * @property {string} [additionalInfo] - Información adicional (opcional)
 * @property {boolean} [isDefault] - Si es la dirección principal del usuario (opcional)
 */
export interface CreateAddressRequest {
  street: string
  number: string
  apartment?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  additionalInfo?: string
  isDefault?: boolean
}

/**
 * Interface para actualizar dirección existente
 * 
 * @interface UpdateAddressRequest
 * @extends Partial<CreateAddressRequest>
 */
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

/**
 * Nueva interface para verificar disponibilidad
 * 
 * @interface AvailabilityCheckResponse
 * @property {boolean} available - Indica si hay disponibilidad
 * @property {string} [reason] - Razón de la disponibilidad (opcional)
 */
export interface AvailabilityCheckResponse {
  available: boolean
  reason?: string
}

/**
 * Nueva interface para eventos de calendario
 * 
 * @interface CalendarEvent
 * @property {number} id - ID único del evento
 * @property {string} title - Título del evento
 * @property {string} start - Fecha y hora de inicio (ISO string)
 * @property {string} end - Fecha y hora de fin (ISO string)
 * @property {ServiceRequest} serviceRequest - Solicitud de servicio asociada
 */
export interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
  serviceRequest: ServiceRequest
}

/**
 * Interfaz para ofertas de solicitudes de servicio
 * 
 * @interface ServiceRequestOffer
 * @property {number} id - ID único de la oferta
 * @property {number} serviceRequestId - ID de la solicitud de servicio asociada
 * @property {number} technicianId - ID del técnico que realiza la oferta
 * @property {number} price - Precio ofrecido por el técnico
 * @property {string} [message] - Mensaje opcional del técnico
 * @property {'pending' | 'accepted' | 'rejected'} status - Estado de la oferta
 * @property {string} createdAt - Fecha de creación de la oferta
 * @property {string} updatedAt - Fecha de última actualización
 * @property {User} technician - Datos del técnico que realiza la oferta
 */
export interface ServiceRequestOffer {
  id: number
  serviceRequestId: number
  technicianId: number
  price: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
  technician?: User
}

/**
 * Interfaz para propuestas de fechas alternativas
 * 
 * @interface AlternativeDateProposal
 * @property {number} id - ID único de la propuesta
 * @property {number} serviceRequestId - ID de la solicitud de servicio asociada
 * @property {number} technicianId - ID del técnico que realiza la propuesta
 * @property {string} proposedDateTime - Fecha y hora propuesta (ISO string)
 * @property {'pending' | 'accepted' | 'rejected'} status - Estado de la propuesta
 * @property {string} [comment] - Comentario opcional sobre la propuesta
 * @property {string} createdAt - Fecha de creación de la propuesta
 * @property {string} [resolvedAt] - Fecha de resolución (opcional)
 * @property {number} proposalCount - Contador de propuestas realizadas
 * @property {User} technician - Datos del técnico que realiza la propuesta
 */
export interface AlternativeDateProposal {
  id: number
  serviceRequestId: number
  technicianId: number
  proposedDateTime: string
  status: 'pending' | 'accepted' | 'rejected'
  comment?: string
  createdAt: string
  resolvedAt?: string
  proposalCount: number
  technician: User
}

/**
 * DTO para crear propuestas de fechas alternativas
 * 
 * @interface CreateAlternativeDateProposalRequest
 * @property {string} alternativeDateTime - Nueva fecha y hora alternativa
 * @property {string} [comment] - Comentario opcional
 */
export interface CreateAlternativeDateProposalRequest {
  alternativeDateTime: string
  comment?: string
}

/**
 * Interfaz para calificaciones
 * 
 * @interface Rating
 * @property {number} id - ID único de la calificación
 * @property {number} raterId - ID del usuario que califica
 * @property {number} ratedId - ID del usuario calificado
 * @property {number} score - Puntuación dada (1 a 5)
 * @property {string} [comment] - Comentario opcional del evaluador
 * @property {number} serviceRequestId - ID de la solicitud de servicio asociada
 * @property {string} createdAt - Fecha de creación de la calificación
 * @property {Object} [rater] - Datos del usuario que realiza la calificación (opcional)
 * @property {number} rater.id - ID del evaluador
 * @property {string} rater.firstName - Primer nombre del evaluador
 * @property {string} rater.firstLastName - Primer apellido del evaluador
 * @property {string} [rater.profilePhotoUrl] - URL de la foto de perfil del evaluador (opcional)
 */
export interface Rating {
  id: number
  raterId: number
  ratedId: number
  score: number
  comment?: string
  serviceRequestId: number
  createdAt: string
  rater?: {
    id: number
    firstName: string
    firstLastName: string
    profilePhotoUrl?: string
  }
}

/**
 * Interface para crear una nueva calificación
 * 
 * @interface CreateRatingRequest
 * @property {number} raterId - ID del usuario que califica
 * @property {number} ratedId - ID del usuario calificado
 * @property {number} score - Puntuación de la calificación
 * @property {string} [comment] - Comentario opcional
 * @property {number} serviceRequestId - ID de la solicitud de servicio asociada
 */
export interface CreateRatingRequest {
  raterId: number
  ratedId: number
  score: number
  comment?: string
  serviceRequestId: number
}

/**
 * Nueva interface para cambio de contraseña
 * 
 * @interface ChangePasswordRequest
 * @property {string} currentPassword - Contraseña actual del usuario
 * @property {string} newPassword - Nueva contraseña deseada
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * Tipos específicos para administradores
 * 
 * @interface AdminUserManagement
 * @property {number} id - ID del usuario administrador
 * @property {string} firstName - Primer nombre
 * @property {string} [middleName] - Segundo nombre (opcional)
 * @property {string} firstLastName - Primer apellido
 * @property {string} [secondLastName] - Segundo apellido (opcional)
 * @property {string} email - Correo electrónico único
 * @property {'client' | 'technician' | 'admin'} role - Rol del usuario en el sistema
 * @property {boolean} status - Estado activo/inactivo del usuario
 * @property {string} [profilePhotoUrl] - URL de la foto de perfil (Cloudinary)
 * @property {string} createdAt - Fecha de creación del usuario
 * @property {string} updatedAt - Fecha de última actualización
 */
export interface AdminUserManagement {
  id: number
  firstName: string
  middleName?: string
  firstLastName: string
  secondLastName?: string
  email: string
  role: 'client' | 'technician' | 'admin'
  status: boolean
  profilePhotoUrl?: string
  createdAt: string
  updatedAt: string
}

/**
 * Interface para crear un nuevo usuario administrador
 * 
 * @interface CreateAdminUserRequest
 * @property {string} firstName - Primer nombre
 * @property {string} [middleName] - Segundo nombre (opcional)
 * @property {string} firstLastName - Primer apellido
 * @property {string} [secondLastName] - Segundo apellido (opcional)
 * @property {string} email - Correo electrónico único
 * @property {string} password - Contraseña (mínimo 6 caracteres)
 * @property {'admin'} role - Rol del usuario (siempre 'admin' para este tipo)
 */
export interface CreateAdminUserRequest {
  firstName: string
  middleName?: string
  firstLastName: string
  secondLastName?: string
  email: string
  password: string
  role: 'admin'
}

/**
 * Interface para estadísticas generales del sistema
 * 
 * @interface AdminStats
 * @property {number} totalUsers - Total de usuarios registrados
 * @property {number} totalClients - Total de clientes
 * @property {number} totalTechnicians - Total de técnicos
 * @property {number} totalAdmins - Total de administradores
 * @property {number} activeUsers - Total de usuarios activos
 * @property {number} inactiveUsers - Total de usuarios inactivos
 * @property {number} totalServiceRequests - Total de solicitudes de servicio
 * @property {number} pendingRequests - Total de solicitudes pendientes
 * @property {number} completedRequests - Total de solicitudes completadas
 * @property {number} averageRating - Calificación promedio del sistema
 */
export interface AdminStats {
  totalUsers: number
  totalClients: number
  totalTechnicians: number
  totalAdmins: number
  activeUsers: number
  inactiveUsers: number
  totalServiceRequests: number
  pendingRequests: number
  completedRequests: number
  averageRating: number
}

/**
 * Interface para filtros de búsqueda de usuarios
 * 
 * @interface UserFilters
 * @property {'client' | 'technician' | 'admin' | 'all'} [role] - Rol del usuario a filtrar
 * @property {'active' | 'inactive' | 'all'} [status] - Estado del usuario a filtrar
 * @property {string} [search] - Término de búsqueda para nombre o correo
 */
export interface UserFilters {
  role?: 'client' | 'technician' | 'admin' | 'all'
  status?: 'active' | 'inactive' | 'all'
  search?: string
}

/**
 * Tipos para sistema de tickets de ayuda
 * 
 * @constant
 * @type {object}
 * @property {string} CANCEL_SERVICE - Tipo de ticket para cancelar servicio
 * @property {string} RESCHEDULE_SERVICE - Tipo de ticket para reprogramar servicio
 * @property {string} TECHNICAL_ISSUE - Tipo de ticket para problemas técnicos
 * @property {string} PAYMENT_ISSUE - Tipo de ticket para problemas de pago
 * @property {string} GENERAL_INQUIRY - Tipo de ticket para consultas generales
 * @property {string} COMPLAINT - Tipo de ticket para presentar quejas
 * 
 * @example
 * ```typescript
 * const ticketType = HelpTicketType.CANCEL_SERVICE; // 'cancel_service'
 * ```
 */
export const HelpTicketType = {
  CANCEL_SERVICE: 'cancel_service',
  RESCHEDULE_SERVICE: 'reschedule_service',
  TECHNICAL_ISSUE: 'technical_issue',
  PAYMENT_ISSUE: 'payment_issue',
  GENERAL_INQUIRY: 'general_inquiry',
  COMPLAINT: 'complaint'
} as const

/**
 * Tipo derivado de las constantes de HelpTicketType
 * 
 * @typedef {string} HelpTicketType
 */
export type HelpTicketType = typeof HelpTicketType[keyof typeof HelpTicketType]

/**
 * Constantes para estados de tickets de ayuda
 * 
 * @constant
 * @type {object}
 * @property {string} PENDING - Estado de ticket pendiente
 * @property {string} IN_REVIEW - Estado de ticket en revisión
 * @property {string} APPROVED - Estado de ticket aprobado
 * @property {string} REJECTED - Estado de ticket rechazado
 * @property {string} RESOLVED - Estado de ticket resuelto
 * 
 * @example
 * ```typescript
 * const ticketStatus = HelpTicketStatus.APPROVED; // 'approved'
 * ```
 */
export const HelpTicketStatus = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESOLVED: 'resolved'
} as const

/**
 * Tipo derivado de los estados de HelpTicketStatus
 * 
 * @typedef {string} HelpTicketStatus
 */
export type HelpTicketStatus = typeof HelpTicketStatus[keyof typeof HelpTicketStatus]

/**
 * Interface para tickets de ayuda
 * 
 * @interface HelpTicket
 * @property {number} id - ID único del ticket
 * @property {HelpTicketType} type - Tipo de ticket
 * @property {string} subject - Asunto del ticket
 * @property {string} description - Descripción del problema
 * @property {string} [reason] - Razón del ticket (opcional)
 * @property {HelpTicketStatus} status - Estado actual del ticket
 * @property {string} [adminResponse] - Respuesta del administrador (opcional)
 * @property {string} [adminNotes] - Notas del administrador (opcional)
 * @property {number} userId - ID del usuario que creó el ticket
 * @property {number} [serviceRequestId] - ID de la solicitud de servicio asociada (opcional)
 * @property {number} [assignedAdminId] - ID del administrador asignado (opcional)
 * @property {number} [resolvedByAdminId] - ID del administrador que resolvió (opcional)
 * @property {string} createdAt - Fecha de creación del ticket
 * @property {string} updatedAt - Fecha de última actualización
 * @property {string} [resolvedAt] - Fecha de resolución (opcional)
 * @property {User} user - Datos del usuario que creó el ticket
 * @property {ServiceRequest} [serviceRequest] - Solicitud de servicio asociada (opcional)
 * @property {User} [assignedAdmin] - Administrador asignado (opcional)
 * @property {User} [resolvedByAdmin] - Administrador que resolvió (opcional)
 * @property {string} userName - Nombre del usuario (computado)
 * @property {string} userRole - Rol del usuario (computado)
 * @property {boolean} isCancellationRequest - Indica si es una solicitud de cancelación (computado)
 * @property {boolean} isPending - Indica si el ticket está pendiente (computado)
 * @property {boolean} isResolved - Indica si el ticket está resuelto (computado)
 */
export interface HelpTicket {
  id: number
  type: HelpTicketType
  subject: string
  description: string
  reason?: string
  status: HelpTicketStatus
  adminResponse?: string
  adminNotes?: string
  userId: number
  serviceRequestId?: number
  assignedAdminId?: number
  resolvedByAdminId?: number
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  // Relaciones
  user: User
  serviceRequest?: ServiceRequest
  assignedAdmin?: User
  resolvedByAdmin?: User
  // Computed properties
  userName: string
  userRole: string
  isCancellationRequest: boolean
  isPending: boolean
  isResolved: boolean
}

/**
 * Interface para crear un nuevo ticket de ayuda
 * 
 * @interface CreateHelpTicketRequest
 * @property {HelpTicketType} type - Tipo de ticket a crear
 * @property {string} subject - Asunto del ticket
 * @property {string} description - Descripción del problema
 * @property {string} [reason] - Razón del ticket (opcional)
 * @property {number} [serviceRequestId] - ID de la solicitud de servicio asociada (opcional)
 */
export interface CreateHelpTicketRequest {
  type: HelpTicketType
  subject: string
  description: string
  reason?: string
  serviceRequestId?: number
}

/**
 * Interface para responder a un ticket de ayuda
 * 
 * @interface RespondHelpTicketRequest
 * @property {HelpTicketStatus} status - Nuevo estado del ticket
 * @property {string} adminResponse - Respuesta del administrador
 * @property {string} [adminNotes] - Notas adicionales del administrador (opcional)
 */
export interface RespondHelpTicketRequest {
  status: HelpTicketStatus
  adminResponse: string
  adminNotes?: string
}

/**
 * Interface para estadísticas de tickets de ayuda
 * 
 * @interface HelpTicketStats
 * @property {number} total - Total de tickets
 * @property {number} pending - Tickets pendientes
 * @property {number} inReview - Tickets en revisión
 * @property {number} approved - Tickets aprobados
 * @property {number} rejected - Tickets rechazados
 * @property {number} resolved - Tickets resueltos
 * @property {Record<string, number>} byType - Tickets agrupados por tipo
 */
export interface HelpTicketStats {
  total: number
  pending: number
  inReview: number
  approved: number
  rejected: number
  resolved: number
  byType: Record<string, number>
}