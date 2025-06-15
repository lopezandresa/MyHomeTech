/**
 * @fileoverview Documentación JSDoc del Backend MyHomeTech
 * 
 * @description Esta documentación cubre todos los aspectos del backend de MyHomeTech:
 * - Controladores y servicios principales
 * - Entidades y DTOs
 * - Configuración de la aplicación
 * - Sistema de autenticación y autorización
 * - Gestión de solicitudes de servicio
 * - Notificaciones en tiempo real
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

# Documentación JSDoc - MyHomeTech Backend 🛠️

## 📋 Resumen de Documentación

Este documento proporciona una guía completa de toda la documentación JSDoc implementada en el backend de MyHomeTech.

## 🎯 Archivos Documentados

### 🔧 Archivos Principales
- **`main.ts`** - Punto de entrada y configuración de la aplicación NestJS
- **`app.module.ts`** - Módulo raíz con configuración de base de datos y módulos

### 🔐 Autenticación y Autorización
- **`auth.controller.ts`** - Controlador de login/logout
- **`auth.service.ts`** - Servicio de autenticación JWT
- **`jwt.strategy.ts`** - Estrategia de autenticación JWT

### 🎯 Servicios Principales
- **`service-request.controller.ts`** - Controlador principal de solicitudes
- **`service-request.service.ts`** - Lógica de negocio de solicitudes
- **`service-request.gateway.ts`** - WebSocket gateway para notificaciones

### 👥 Gestión de Usuarios
- **`identity.controller.ts`** - Gestión de usuarios base
- **`client.controller.ts`** - Funcionalidades específicas de clientes
- **`technician.controller.ts`** - Funcionalidades específicas de técnicos

### 🏠 Catálogo y Direcciones
- **`appliance.controller.ts`** - Gestión de electrodomésticos
- **`address.controller.ts`** - Gestión de direcciones

## 📖 Tipos de Documentación Incluida

### 1. **@fileoverview**
Cada archivo incluye una descripción completa del propósito y funcionalidad.

### 2. **Clases y Servicios**
Documentación completa incluyendo:
- Descripción de la responsabilidad de la clase
- Parámetros de constructor
- Métodos públicos y privados
- Ejemplos de uso

### 3. **Controladores**
- Descripción de endpoints
- Parámetros de entrada (DTOs)
- Respuestas esperadas
- Códigos de estado HTTP
- Ejemplos de requests

### 4. **Entidades TypeORM**
- Descripción de propiedades
- Relaciones entre entidades
- Validaciones y constraints
- Ejemplos de uso

### 5. **DTOs (Data Transfer Objects)**
- Validaciones de entrada
- Transformaciones de datos
- Ejemplos de payloads

## 🔍 Convenciones de Documentación

### Estructura Estándar
```typescript
/**
 * @fileoverview Breve descripción del archivo
 * 
 * @description Descripción detallada incluyendo:
 * - Funcionalidades principales
 * - Dependencias importantes
 * - Casos de uso
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */
```

### Documentación de Servicios
```typescript
/**
 * Descripción del servicio
 * 
 * @description Funcionalidad detallada incluyendo:
 * - Responsabilidades principales
 * - Dependencias inyectadas
 * - Casos de uso típicos
 * 
 * @example
 * ```typescript
 * // Ejemplo de uso
 * const result = await service.method(params);
 * ```
 */
```

### Documentación de Controladores
```typescript
/**
 * Descripción del endpoint
 * 
 * @description Comportamiento detallado del endpoint:
 * - Validaciones realizadas
 * - Procesos ejecutados
 * - Respuestas posibles
 * 
 * @param {Type} param - Descripción del parámetro
 * @returns {Promise<Type>} Descripción de la respuesta
 * @throws {ExceptionType} Descripción de errores posibles
 * 
 * @example
 * ```typescript
 * // Ejemplo de request
 * POST /api/endpoint
 * {
 *   "property": "value"
 * }
 * ```
 */
```

### Documentación de Entidades
```typescript
/**
 * Descripción de la entidad
 * 
 * @description Representa [descripción del modelo de datos]:
 * - Propiedades principales
 * - Relaciones con otras entidades
 * - Validaciones aplicadas
 * 
 * @example
 * ```typescript
 * const entity = repository.create({
 *   property: 'value'
 * });
 * ```
 */
```

## 🚀 Beneficios de la Documentación

### Para Desarrolladores
- **Comprensión rápida** del código existente
- **Integración eficiente** de nuevos miembros del equipo
- **Reducción de errores** mediante ejemplos claros
- **Mantenimiento simplificado** del código

### Para el Proyecto
- **Consistencia** en el desarrollo
- **Calidad mejorada** del código
- **Facilita el debugging** y resolución de problemas
- **Base sólida** para escalabilidad

## 📋 Patrones de Código Documentados

### 1. **Inyección de Dependencias**
```typescript
/**
 * Constructor del servicio
 * 
 * @param {Repository<Entity>} entityRepo - Repositorio de la entidad
 * @param {OtherService} otherService - Servicio relacionado
 */
constructor(
  @InjectRepository(Entity)
  private readonly entityRepo: Repository<Entity>,
  private readonly otherService: OtherService,
) {}
```

### 2. **Manejo de Errores**
```typescript
/**
 * Método que puede lanzar excepciones
 * 
 * @throws {NotFoundException} Si el recurso no existe
 * @throws {ConflictException} Si hay conflicto de datos
 * @throws {BadRequestException} Si los datos son inválidos
 */
```

### 3. **Validaciones y DTOs**
```typescript
/**
 * DTO para crear recurso
 * 
 * @description Valida y transforma datos de entrada:
 * - Email único y válido
 * - Contraseña con criterios de seguridad
 * - Campos obligatorios y opcionales
 */
```

### 4. **WebSocket y Notificaciones**
```typescript
/**
 * Gateway para notificaciones en tiempo real
 * 
 * @description Maneja eventos WebSocket:
 * - Notificaciones a usuarios específicos
 * - Broadcast a grupos de usuarios
 * - Manejo de conexiones y desconexiones
 */
```

## 🔧 Herramientas de Desarrollo

### Generación de Documentación
```bash
# Generar documentación HTML (futuro)
npm run docs:generate

# Validar documentación JSDoc
npm run docs:validate
```

### IDE Support
- **VSCode**: Autocompletado mejorado con JSDoc
- **IntelliSense**: Tooltips con documentación
- **Type checking**: Validación en tiempo real

## 📚 Recursos Adicionales

### Enlaces Útiles
- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [NestJS Documentation](https://docs.nestjs.com/)

### Estándares del Proyecto
- Todos los controladores deben tener `@fileoverview`
- Todos los servicios públicos deben estar documentados
- Los ejemplos deben ser funcionales y realistas
- La documentación debe mantenerse actualizada con el código

---

## 📝 Notas de Mantenimiento

### Actualización de Documentación
- Revisar JSDoc al modificar métodos públicos
- Actualizar ejemplos cuando cambien las APIs
- Mantener coherencia en el estilo de documentación
- Verificar enlaces y referencias cruzadas

### Revisión de Calidad
- ✅ Todos los controladores principales documentados
- ✅ Servicios principales documentados
- ✅ Entidades principales documentadas
- ✅ DTOs documentados
- ✅ Ejemplos de uso incluidos
- ✅ Convenciones consistentes aplicadas

**Última actualización**: Diciembre 2024  
**Versión de documentación**: 1.0.0