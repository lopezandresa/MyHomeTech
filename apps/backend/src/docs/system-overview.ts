/**
 * @fileoverview Documentación general del sistema MyHomeTech Backend
 * 
 * @description MyHomeTech es una plataforma de gestión de servicios técnicos
 * para electrodomésticos que conecta clientes con técnicos especializados.
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * @namespace MyHomeTech
 * @description Espacio de nombres principal del sistema MyHomeTech
 */

/**
 * @namespace MyHomeTech.Services
 * @description Servicios principales del sistema
 * 
 * @property {IdentityService} IdentityService - Gestión de usuarios y autenticación
 * @property {ServiceRequestService} ServiceRequestService - Gestión de solicitudes de servicio
 * @property {TechnicianService} TechnicianService - Gestión de perfiles de técnicos
 * @property {ClientService} ClientService - Gestión de perfiles de clientes
 * @property {AddressService} AddressService - Gestión de direcciones
 * @property {AuthService} AuthService - Autenticación JWT
 * @property {NotificationService} NotificationService - Sistema de notificaciones
 * @property {RatingService} RatingService - Sistema de calificaciones
 */

/**
 * @namespace MyHomeTech.Controllers
 * @description Controladores REST del sistema
 * 
 * @property {IdentityController} IdentityController - Endpoints de usuarios
 * @property {ServiceRequestController} ServiceRequestController - Endpoints de solicitudes
 * @property {TechnicianController} TechnicianController - Endpoints de técnicos
 * @property {ClientController} ClientController - Endpoints de clientes
 * @property {AddressController} AddressController - Endpoints de direcciones
 * @property {AuthController} AuthController - Endpoints de autenticación
 */

/**
 * @namespace MyHomeTech.Entities
 * @description Entidades de base de datos
 * 
 * @property {Identity} Identity - Usuario del sistema
 * @property {ServiceRequest} ServiceRequest - Solicitud de servicio técnico
 * @property {Technician} Technician - Perfil de técnico
 * @property {Client} Client - Perfil de cliente
 * @property {Address} Address - Dirección de servicio
 * @property {Appliance} Appliance - Electrodoméstico
 * @property {Rating} Rating - Calificación de servicio
 * @property {Notification} Notification - Notificación del sistema
 */

/**
 * @overview Arquitectura del Sistema
 * 
 * El sistema MyHomeTech está construido con NestJS y sigue una arquitectura modular:
 * 
 * ## Módulos Principales:
 * 
 * ### 1. Identity Module
 * Gestiona usuarios, autenticación y autorización
 * - Registro y login de usuarios
 * - Gestión de roles (client, technician, admin)
 * - Cambio de contraseñas
 * - Fotos de perfil con Cloudinary
 * 
 * ### 2. Service Request Module
 * Core del negocio - gestiona solicitudes de servicio
 * - Creación de solicitudes por clientes
 * - Notificación a técnicos elegibles
 * - Sistema de fechas alternativas
 * - Control de disponibilidad
 * - Estados: pending, scheduled, completed, cancelled
 * 
 * ### 3. Technician Module
 * Gestión de perfiles técnicos
 * - Especialidades por tipo de electrodoméstico
 * - Experiencia y certificaciones
 * - Fotos de identificación
 * - Gestión de calendario
 * 
 * ### 4. Client Module
 * Gestión de perfiles de clientes
 * - Información personal
 * - Direcciones de servicio
 * - Historial de solicitudes
 * 
 * ### 5. Address Module
 * Gestión de direcciones de servicio
 * - Múltiples direcciones por cliente
 * - Dirección principal
 * - Validación de pertenencia
 * 
 * ## Características Técnicas:
 * 
 * ### Base de Datos:
 * - PostgreSQL con TypeORM
 * - Migraciones automáticas
 * - Relaciones bien definidas
 * - Índices optimizados
 * 
 * ### Autenticación:
 * - JWT con roles
 * - Guards personalizados
 * - Middleware de autorización
 * - Tokens de larga duración (7 días)
 * 
 * ### Notificaciones:
 * - WebSocket en tiempo real
 * - Notificaciones instantáneas
 * - Gateway optimizado para velocidad
 * 
 * ### Validación:
 * - DTOs con class-validator
 * - Validación de horarios de trabajo
 * - Control de disponibilidad
 * - Prevención de conflictos
 * 
 * ### Gestión de Archivos:
 * - Integración con Cloudinary
 * - Optimización automática de imágenes
 * - URLs seguras y optimizadas
 * 
 * ## Flujo de Trabajo Principal:
 * 
 * 1. **Cliente crea solicitud**
 *    - Selecciona electrodoméstico y dirección
 *    - Propone fecha y hora
 *    - Sistema valida disponibilidad
 * 
 * 2. **Notificación a técnicos**
 *    - Búsqueda por especialidad
 *    - Verificación de disponibilidad
 *    - Notificación WebSocket instantánea
 * 
 * 3. **Técnico responde**
 *    - Acepta en fecha propuesta, o
 *    - Propone fecha alternativa
 * 
 * 4. **Cliente decide**
 *    - Acepta propuesta alternativa, o
 *    - Rechaza y espera más propuestas
 * 
 * 5. **Servicio programado**
 *    - Notificación de confirmación
 *    - Actualización de calendarios
 *    - Bloqueo de disponibilidad
 * 
 * 6. **Completar servicio**
 *    - Cliente marca como completado
 *    - Sistema de calificaciones
 *    - Historial actualizado
 * 
 * ## APIs Principales:
 * 
 * ### Autenticación:
 * - `POST /api/auth/login` - Login con JWT
 * - `POST /api/identity/register` - Registro de usuarios
 * 
 * ### Solicitudes de Servicio:
 * - `POST /api/service-requests` - Crear solicitud
 * - `GET /api/service-requests/available-for-me` - Técnico ve disponibles
 * - `POST /api/service-requests/:id/accept` - Técnico acepta
 * - `POST /api/service-requests/:id/propose-alternative-date` - Proponer fecha
 * 
 * ### Gestión de Perfiles:
 * - `POST /api/clients/profile` - Crear perfil cliente
 * - `POST /api/technicians/profile` - Crear perfil técnico
 * - `GET /api/identity/me` - Perfil del usuario actual
 * 
 * ### Direcciones:
 * - `POST /api/addresses` - Crear dirección
 * - `GET /api/addresses` - Listar direcciones del usuario
 * - `POST /api/addresses/:id/set-primary` - Establecer como principal
 * 
 * ## Consideraciones de Rendimiento:
 * 
 * ### Notificaciones Optimizadas:
 * - Uso de `setImmediate()` para notificaciones asíncronas
 * - Verificación de disponibilidad en paralelo
 * - Consultas optimizadas con índices
 * 
 * ### Cache y Optimización:
 * - Relaciones lazy loading donde es apropiado
 * - Consultas con joins optimizados
 * - Paginación en endpoints grandes
 * 
 * ### Escalabilidad:
 * - Arquitectura modular
 * - Servicios desacoplados
 * - WebSocket gateway escalable
 * 
 * @example Ejemplo de uso básico del sistema:
 * ```typescript
 * // 1. Cliente crea solicitud
 * const request = await serviceRequestService.create(clientId, {
 *   applianceId: 1,
 *   addressId: 2,
 *   description: "Refrigerador no enfría",
 *   proposedDateTime: "2024-12-20T10:00:00Z"
 * });
 * 
 * // 2. Técnico ve solicitudes disponibles
 * const availableRequests = await serviceRequestService.findPendingForTechnician(technicianId);
 * 
 * // 3. Técnico acepta solicitud
 * const acceptedRequest = await serviceRequestService.acceptByTechnician(requestId, technicianId);
 * 
 * // 4. Cliente marca como completado
 * const completedRequest = await serviceRequestService.completeByClient(requestId, clientId);
 * 
 * // 5. Cliente califica el servicio
 * const rating = await ratingService.create({
 *   serviceRequestId: requestId,
 *   raterId: clientId,
 *   ratedId: technicianId,
 *   score: 5,
 *   comment: "Excelente servicio"
 * });
 * ```
 */

export {};