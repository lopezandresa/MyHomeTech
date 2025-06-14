import { ServiceType } from '../types'

export const getServiceTypeText = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case ServiceType.MAINTENANCE:
      return 'Mantenimiento'
    case ServiceType.INSTALLATION:
      return 'Instalación'
    case ServiceType.REPAIR:
      return 'Reparación'
    default:
      return 'Reparación'
  }
}

export const getServiceTypeColor = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case ServiceType.MAINTENANCE:
      return 'bg-blue-100 text-blue-800'
    case ServiceType.INSTALLATION:
      return 'bg-green-100 text-green-800'
    case ServiceType.REPAIR:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-orange-100 text-orange-800'
  }
}

export const getServiceTypeIcon = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case ServiceType.MAINTENANCE:
      return '🔧' // Herramientas de mantenimiento
    case ServiceType.INSTALLATION:
      return '⚡' // Instalación eléctrica
    case ServiceType.REPAIR:
      return '🔨' // Reparación
    default:
      return '🔨'
  }
}

export const getServiceTypeOptions = () => [
  {
    value: ServiceType.REPAIR,
    label: 'Reparación',
    description: 'Arreglar un electrodoméstico que no funciona correctamente',
    icon: '🔨'
  },
  {
    value: ServiceType.MAINTENANCE,
    label: 'Mantenimiento',
    description: 'Mantenimiento preventivo para mantener el equipo en buen estado',
    icon: '🔧'
  },
  {
    value: ServiceType.INSTALLATION,
    label: 'Instalación',
    description: 'Instalar un nuevo electrodoméstico o equipo',
    icon: '⚡'
  }
]