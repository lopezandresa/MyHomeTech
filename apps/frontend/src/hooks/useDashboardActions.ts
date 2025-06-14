import { useState } from 'react'
import { serviceRequestService } from '../services/serviceRequestService'
import { useOfferThrottle } from './useOfferThrottle'
import type { ServiceRequest } from '../types/index'

interface UseDashboardActionsProps {
  isClient: boolean
  isTechnician: boolean
  user: any
  setError: (error: string | null) => void
  setClientRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>
  setPendingRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>
  setMyRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>
  loadData: () => Promise<void>
}

export const useDashboardActions = ({
  isClient,
  isTechnician,
  user,
  setError,
  setClientRequests,
  setPendingRequests,
  setMyRequests,
  loadData
}: UseDashboardActionsProps) => {
  // Estados para modales y formularios
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  
  // Hook para throttling de ofertas
  const { canMakeOffer, timeLeft, startThrottle } = useOfferThrottle()

  // ---- ACCIONES PARA CLIENTES ----
  const handleCompleteService = async (requestId: number) => {
    try {
      await serviceRequestService.completeRequest(requestId)
      
      if (isClient) {
        setClientRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
              : req
          )
        )
      }
      
      if (isTechnician) {
        setMyRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
              : req
          )
        )
      }
    } catch (error) {
      console.error('Error completing service:', error)
      setError('Error al marcar como completado')
    }
  }

  const handleAcceptSpecificOffer = async (serviceRequestId: number, offerId: number) => {
    try {
      const updatedRequest = await serviceRequestService.acceptSpecificOffer(serviceRequestId, offerId)
      
      setClientRequests(prev => 
        prev.map(req => 
          req.id === serviceRequestId 
            ? { ...req, status: 'accepted', technicianId: updatedRequest.technicianId }
            : req
        )
      )
    } catch (error) {
      console.error('Error accepting specific offer:', error)
      setError('Error al aceptar la oferta')
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      await serviceRequestService.cancelRequest(requestId)
      
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : req
        )
      )
    } catch (error) {
      console.error('Error cancelling request:', error)
      setError('Error al cancelar la solicitud')
    }
  }

  const handleUpdateClientPrice = async (requestId: number, currentPrice: number) => {
    const newPriceStr = prompt(
      `Precio actual: $${currentPrice.toLocaleString()} COP\n\nIngresa el nuevo precio:`,
      currentPrice.toString()
    )
    
    if (!newPriceStr) return
    
    const newPrice = parseInt(newPriceStr.replace(/[^\d]/g, ''))
    
    if (!newPrice || newPrice <= 0) {
      alert('Por favor ingresa un precio válido')
      return
    }
    
    if (newPrice === currentPrice) {
      alert('El precio debe ser diferente al actual')
      return
    }

    try {
      const updatedRequest = await serviceRequestService.updateClientPrice(requestId, newPrice)
      
      setClientRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      )
      
      alert(`Precio actualizado exitosamente a $${newPrice.toLocaleString()} COP. Los técnicos serán notificados del cambio.`)
    } catch (error) {
      console.error('Error updating client price:', error)
      setError('Error al actualizar el precio')
    }
  }

  // ---- ACCIONES PARA TÉCNICOS ----
  const handleMakeOffer = async (requestId: number) => {
    if (!offerPrice) return
    
    if (!canMakeOffer) {
      setError(`Debes esperar ${timeLeft} segundos antes de hacer otra oferta`)
      return
    }
    
    try {
      await serviceRequestService.offerPrice(requestId, { 
        technicianPrice: parseFloat(offerPrice) 
      })
      setOfferPrice('')
      setSelectedRequest(null)
      startThrottle()
      await loadData()
    } catch (error) {
      console.error('Error making offer:', error)
      setError('Error al hacer la oferta')
    }
  }
  
  const handleAcceptDirectly = async (requestId: number) => {
    try {
      await serviceRequestService.acceptAndSchedule(requestId)
      
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      
      const myUpdatedRequests = await serviceRequestService.getTechnicianRequests(user!.id)
      setMyRequests(myUpdatedRequests)
    } catch (error) {
      console.error('Error accepting request:', error)
      setError('Error al aceptar la solicitud')
    }
  }

  const handleSchedule = async (requestId: number) => {
    if (!scheduleDate) return
    
    try {
      await serviceRequestService.scheduleRequest(requestId, { 
        scheduledAt: scheduleDate 
      })
      setScheduleDate('')
      setSelectedRequest(null)
      
      setMyRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'scheduled', scheduledAt: scheduleDate }
            : req
        )
      )
    } catch (error) {
      console.error('Error scheduling:', error)
      setError('Error al programar el servicio')
    }
  }

  const resetModalStates = () => {
    setSelectedRequest(null)
    setOfferPrice('')
    setScheduleDate('')
  }

  return {
    // Estados
    selectedRequest,
    setSelectedRequest,
    offerPrice,
    setOfferPrice,
    scheduleDate,
    setScheduleDate,
    showNewRequestModal,
    setShowNewRequestModal,
    
    // Throttling
    canMakeOffer,
    timeLeft,
    
    // Acciones para clientes
    handleCompleteService,
    handleAcceptSpecificOffer,
    handleCancelRequest,
    handleUpdateClientPrice,
    
    // Acciones para técnicos
    handleMakeOffer,
    handleAcceptDirectly,
    handleSchedule,
    
    // Utilidades
    resetModalStates
  }
}