export interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'technician' | 'admin'
  status: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'client' | 'technician'
}

export interface AuthResponse {
  access_token: string
  User: User
}

export interface UpdateProfileRequest {
  name?: string
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
  idPhotoUrl: string
  specialties: ApplianceType[]
}

export interface CreateTechnicianProfileRequest {
  identityId: number
  cedula: string
  birthDate: string
  experienceYears: number
  idPhotoUrl: string
  specialties: number[]
}

// Solicitud de servicio
export interface ServiceRequest {
  id: number
  clientId: number
  applianceId: number
  description: string
  clientPrice: number
  technicianPrice?: number
  status: 'pending' | 'offered' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  expiresAt?: string
  technicianId?: number
  acceptedAt?: string
  scheduledAt?: string
  completedAt?: string
  cancelledAt?: string
  client: User
  appliance: Appliance
  technician?: User
}

export interface CreateServiceRequestRequest {
  applianceId: number
  description: string
  clientPrice: number
  validMinutes?: number // Opcional, por defecto 5 minutos
}

export interface OfferPriceRequest {
  technicianPrice: number
}

export interface AcceptRequestRequest {
  acceptClientPrice: boolean
}

export interface ScheduleRequestRequest {
  scheduledAt: string
}