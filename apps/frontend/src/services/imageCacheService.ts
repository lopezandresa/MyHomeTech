import React from 'react'

// Servicio de caché para imágenes de perfil
class ImageCacheService {
  private readonly CACHE_PREFIX = 'img_cache_'
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas en milisegundos
  private readonly MAX_CACHE_SIZE = 5 * 1024 * 1024 // 5MB límite para localStorage

  // Generar clave de caché
  private getCacheKey(url: string): string {
    return `${this.CACHE_PREFIX}${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`
  }

  // Verificar si una imagen está en caché y es válida
  isImageCached(url: string): boolean {
    const cacheKey = this.getCacheKey(url)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return false
    
    try {
      const { timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > this.CACHE_EXPIRY
      
      if (isExpired) {
        localStorage.removeItem(cacheKey)
        return false
      }
      
      return true
    } catch {
      localStorage.removeItem(cacheKey)
      return false
    }
  }

  // Obtener imagen desde caché
  getCachedImage(url: string): string | null {
    if (!this.isImageCached(url)) return null
    
    const cacheKey = this.getCacheKey(url)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    try {
      const { data } = JSON.parse(cached)
      return data
    } catch {
      localStorage.removeItem(cacheKey)
      return null
    }
  }

  // Descargar y cachear imagen
  async cacheImage(url: string): Promise<string> {
    try {
      // Verificar si ya está en caché
      const cached = this.getCachedImage(url)
      if (cached) return cached

      // Descargar imagen
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch image')
      
      const blob = await response.blob()
      
      // Verificar tamaño antes de cachear
      if (blob.size > this.MAX_CACHE_SIZE) {
        console.warn('Image too large for cache:', blob.size)
        return url // Retornar URL original si es muy grande
      }

      // Convertir a base64
      const base64 = await this.blobToBase64(blob)
      
      // Verificar espacio disponible en localStorage
      try {
        const cacheKey = this.getCacheKey(url)
        const cacheData = JSON.stringify({
          data: base64,
          timestamp: Date.now(),
          size: blob.size
        })
        
        localStorage.setItem(cacheKey, cacheData)
        return base64
      } catch (e) {
        // localStorage lleno, limpiar caché antiguo
        this.cleanOldCache()
        return url // Retornar URL original si no se puede cachear
      }
    } catch (error) {
      console.error('Error caching image:', error)
      return url // Retornar URL original en caso de error
    }
  }

  // Convertir blob a base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Limpiar caché antiguo
  private cleanOldCache(): void {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX))
    
    // Ordenar por timestamp y eliminar los más antiguos
    const cacheEntries = cacheKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        return { key, timestamp: data.timestamp || 0 }
      } catch {
        return { key, timestamp: 0 }
      }
    }).sort((a, b) => a.timestamp - b.timestamp)
    
    // Eliminar la mitad más antigua
    const toRemove = cacheEntries.slice(0, Math.ceil(cacheEntries.length / 2))
    toRemove.forEach(({ key }) => localStorage.removeItem(key))
  }

  // Limpiar todo el caché de imágenes
  clearImageCache(): void {
    const keys = Object.keys(localStorage)
    keys.filter(key => key.startsWith(this.CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key))
  }

  // Obtener estadísticas del caché
  getCacheStats(): { count: number; totalSize: number } {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX))
    
    let totalSize = 0
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        totalSize += data.size || 0
      } catch {}
    })
    
    return {
      count: cacheKeys.length,
      totalSize
    }
  }
}

export const imageCacheService = new ImageCacheService()

// Hook para usar imágenes cacheadas
export const useImageCache = (url?: string) => {
  const [cachedUrl, setCachedUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!url) {
      setCachedUrl(null)
      return
    }

    // Si es una URL de blob local (preview), usarla directamente
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      setCachedUrl(url)
      return
    }

    const loadImage = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const cached = await imageCacheService.cacheImage(url)
        setCachedUrl(cached)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading image')
        setCachedUrl(url) // Fallback a URL original
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [url])

  return { cachedUrl, isLoading, error }
}