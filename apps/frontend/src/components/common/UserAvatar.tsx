import React, { useState } from 'react'
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline'
import { authService } from '../../services/authService'
import type { User } from '../../types/index'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showName?: boolean
  editable?: boolean
  onEditClick?: () => void
  isUploading?: boolean
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '', 
  showName = false,
  editable = false,
  onEditClick,
  isUploading = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
    xl: 'h-9 w-9'
  }

  const editIconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  }

  const photoUrl = user.profilePhotoPath?.startsWith('blob:') 
    ? user.profilePhotoPath // Si es una URL de preview local, usarla directamente
    : authService.getProfilePhotoUrl(user.profilePhotoPath)

  const handleClick = () => {
    if (editable && onEditClick) {
      onEditClick()
    }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center relative ${
          editable ? 'cursor-pointer transition-all duration-200 hover:ring-4 hover:ring-blue-200' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Foto de ${user.name}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Si la imagen falla al cargar, mostrar el icono por defecto
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<svg class="${iconSizeClasses[size]} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`
              }
            }}
          />
        ) : (
          <UserIcon className={`${iconSizeClasses[size]} text-white`} />
        )}
        
        {/* Overlay de edición */}
        {editable && (isHovered || isUploading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-200">
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <PencilIcon className={`${editIconSizeClasses[size]} text-white`} />
            )}
          </div>
        )}
      </div>
      
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
          <span className="text-xs text-gray-500 capitalize">{user.role}</span>
        </div>
      )}
    </div>
  )
}

export default UserAvatar