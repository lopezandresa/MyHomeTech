import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formats a date string or Date object to the standard format 'dd/MM/yyyy'
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'dd/MM/yyyy', { locale: es })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Parses a date string from standard format 'dd/MM/yyyy' to a Date object
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  
  try {
    // If the date is already in yyyy-MM-dd format (from input type="date")
    if (dateStr.includes('-')) {
      return new Date(dateStr)
    }
    
    // Parse from dd/MM/yyyy format
    return parse(dateStr, 'dd/MM/yyyy', new Date(), { locale: es })
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

/**
 * Converts a date from standard format 'dd/MM/yyyy' to 'yyyy-MM-dd' format for HTML date inputs
 */
export const toInputDateValue = (dateStr: string): string => {
  if (!dateStr) return ''
  
  try {
    // If already in yyyy-MM-dd format
    if (dateStr.includes('-')) {
      return dateStr
    }
    
    // Parse from dd/MM/yyyy and format to yyyy-MM-dd
    const date = parse(dateStr, 'dd/MM/yyyy', new Date(), { locale: es })
    return format(date, 'yyyy-MM-dd')
  } catch (error) {
    console.error('Error converting date format:', error)
    return ''
  }
}

/**
 * Converts a date from ISO string or any other format to 'yyyy-MM-dd' format for HTML date inputs
 */
export const toInputDateFormat = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'yyyy-MM-dd')
  } catch (error) {
    console.error('Error converting to input date format:', error)
    return ''
  }
}

/**
 * Formats a date string or Date object to include both date and time 'dd/MM/yyyy HH:mm'
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return ''
  }
}

/**
 * Formats only the time part 'HH:mm'
 */
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'HH:mm', { locale: es })
  } catch (error) {
    console.error('Error formatting time:', error)
    return ''
  }
}
