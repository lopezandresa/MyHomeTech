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
  get fullName(): string
  // Agregar propiedad name para compatibilidad
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  middleName?: string
  firstLastName: string
  secondLastName?: string
  email: string
  password: string
  role: 'client' | 'technician'
}

export interface AuthResponse {
  access_token: string
  User: User
}

export interface UpdateProfileRequest {
  firstName?: string
  middleName?: string
  firstLastName?: string
  secondLastName?: string
  email?: string
  password?: string
}

// Cliente
export interface ClientProfile {
  id: number
  identityId: number
  fullName: string
  cedula: string
  birthDate: string
  phone: string
  identity: User
}

export interface CreateClientProfileRequest {
  identityId: number
  fullName: string
  cedula: string
  birthDate: string
  phone: string
}

// Técnico
export interface Appliance {
  id: number
  type: string
  brand: string
  model: string
  name: string
  isActive: boolean
}

export interface ApplianceType {
  id: number
  name: string
  description?: string
  isActive: boolean
}

export interface ApplianceBrand {
  id: number
  name: string
  typeId: number
  isActive: boolean
  type?: ApplianceType
}

export interface ApplianceModel {
  id: number
  name: string
  description?: string
  brandId: number
  isActive: boolean
  brand?: ApplianceBrand
}

export interface TechnicianProfile {
  id: number
  identityId: number
  cedula: string
  birthDate: string
  experienceYears: number
  idPhotoPath: string
  specialties: ApplianceType[]
}

export interface CreateTechnicianProfileRequest {
  identityId: number
  cedula: string
  birthDate: string
  experienceYears: number
  specialties: number[]
  idPhotoFile?: File
}

// Solicitud de servicio
export const ServiceType = {
  MAINTENANCE: 'maintenance',   // Mantenimiento preventivo
  INSTALLATION: 'installation', // Instalación de equipos
  REPAIR: 'repair',             // Reparación/arreglo
} as const

export type ServiceType = typeof ServiceType[keyof typeof ServiceType]

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
  // Nueva propiedad para propuestas de fechas alternativas
  alternativeDateProposals?: AlternativeDateProposal[]
  // Relaciones
  client: User
  technician?: User
  appliance: Appliance
  address: Address
  createdAt: string
  updatedAt: string
}

export interface CreateServiceRequestRequest {
  applianceId: number
  addressId: number
  description: string
  serviceType?: ServiceType // Nuevo campo opcional, por defecto REPAIR
  clientPrice: number // Precio que el cliente está dispuesto a pagar
  proposedDateTime: string // Nueva: fecha y hora propuesta
  validHours?: number // Tiempo de validez en horas, por defecto 24 horas
}

export interface AcceptRequestRequest {
  acceptClientPrice: boolean
}

export interface ScheduleRequestRequest {
  scheduledAt: string
}

// Direcciones
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

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Nueva interface para verificar disponibilidad
export interface AvailabilityCheckResponse {
  available: boolean
  reason?: string
}

// Nueva interface para eventos de calendario
export interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
  serviceRequest: ServiceRequest
}

// Interfaz para ofertas de solicitudes de servicio
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

// Interfaz para propuestas de fechas alternativas
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

// DTO para crear propuestas de fechas alternativas
export interface CreateAlternativeDateProposalRequest {
  alternativeDateTime: string
  comment?: string
}

// Interfaz para calificaciones
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

export interface CreateRatingRequest {
  raterId: number
  ratedId: number
  score: number
  comment?: string
  serviceRequestId: number
}

// Nueva interface para cambio de contraseña
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Tipos específicos para administradores
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

export interface CreateAdminUserRequest {
  firstName: string
  middleName?: string
  firstLastName: string
  secondLastName?: string
  email: string
  password: string
  role: 'admin'
}

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

export interface UserFilters {
  role?: 'client' | 'technician' | 'admin' | 'all'
  status?: 'active' | 'inactive' | 'all'
  search?: string
}