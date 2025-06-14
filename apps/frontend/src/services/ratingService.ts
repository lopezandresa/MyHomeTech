import api from './api'

export interface CreateRatingRequest {
  raterId: number
  ratedId: number
  score: number
  comment?: string
  serviceRequestId: number
}

export interface Rating {
  id: number
  raterId: number
  ratedId: number
  score: number
  comment?: string
  serviceRequestId: number
}

class RatingService {
  // Crear una nueva calificación
  async createRating(data: CreateRatingRequest): Promise<Rating> {
    const response = await api.post<Rating>('/ratings', data)
    return response.data
  }

  // Obtener todas las calificaciones
  async getAllRatings(): Promise<Rating[]> {
    const response = await api.get<Rating[]>('/ratings')
    return response.data
  }

  // Obtener calificaciones de un usuario específico
  async getUserRatings(userId: number): Promise<Rating[]> {
    const response = await api.get<Rating[]>(`/ratings/user/${userId}`)
    return response.data
  }
}

export const ratingService = new RatingService()
export default ratingService