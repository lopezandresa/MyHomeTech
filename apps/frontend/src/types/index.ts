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
export interface ServiceRequest {
  id: number
  clientId: number
  applianceId: number
  addressId: number
  description: string
  clientPrice: number
  technicianPrice?: number // Mantenido por compatibilidad
  status: 'pending' | 'offered' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
  createdAt: string
  expiresAt?: string
  technicianId?: number
  acceptedAt?: string
  scheduledAt?: string
  completedAt?: string
  cancelledAt?: string
  expiredAt?: string
  client: User
  appliance: Appliance
  address: Address
  technician?: User
  offers?: ServiceRequestOffer[] // Nuevas ofertas múltiples
}

export interface CreateServiceRequestRequest {
  applianceId: number
  addressId: number
  description: string
  clientPrice: number
  validMinutes?: number // Opcional, por defecto 5 minutos
}

export interface OfferPriceRequest {
  technicianPrice: number
  comment?: string
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

// Ofertas de técnicos
export interface ServiceRequestOffer {
  id: number
  serviceRequestId: number
  technicianId: number
  price: number
  status: 'pending' | 'accepted' | 'rejected'
  comment?: string
  createdAt: string
  resolvedAt?: string
  technician: User // Identity/User object, not full TechnicianProfile
}