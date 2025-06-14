import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'accepted':
      return 'bg-green-100 text-green-800'
    case 'scheduled':
      return 'bg-purple-100 text-purple-800'
    case 'in_progress':
      return 'bg-orange-100 text-orange-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'accepted':
      return 'Aceptada'
    case 'scheduled':
      return 'Programada'
    case 'in_progress':
      return 'En Progreso'
    case 'completed':
      return 'Completada'
    case 'cancelled':
      return 'Cancelada'
    case 'expired':
      return 'Expirada'
    default:
      return status
  }
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <ClockIcon className="h-5 w-5" />
    case 'accepted':
    case 'scheduled':
      return <CalendarIcon className="h-5 w-5" />
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5" />
    case 'cancelled':
      return <XCircleIcon className="h-5 w-5" />
    default:
      return <ClipboardDocumentListIcon className="h-5 w-5" />
  }
}