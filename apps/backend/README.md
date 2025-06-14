# MyHomeTech - API Backend

API Backend para plataforma de servicios de mantenimiento de electrodomésticos desarrollada con NestJS, TypeScript y PostgreSQL.

## 📋 Descripción

MyHomeTech es una aplicación web que conecta clientes que necesitan servicios de mantenimiento de electrodomésticos con técnicos especializados. El sistema permite solicitar, gestionar y calificar servicios de manera rápida y eficiente con un moderno sistema de múltiples ofertas.

### ✨ Características Principales

- **Sistema de Autenticación JWT** con roles diferenciados (Cliente, Técnico, Admin)
- **Gestión de Usuarios** con perfiles especializados y validación de identidad
- **Sistema Multi-Ofertas** - Múltiples técnicos pueden ofertar en la misma solicitud
- **Programación Inteligente** con validación de disponibilidad y conflictos
- **Sistema de Calificaciones** y reputación de técnicos
- **Notificaciones en Tiempo Real** con WebSockets
- **Gestión de Electrodomésticos** con marcas, modelos y especialidades
- **API RESTful** completamente documentada con Swagger
- **Control de Acceso Basado en Roles** (RBAC)
- **Base de Datos PostgreSQL** con TypeORM y migraciones automáticas

### 👥 Tipos de Usuario

- **Clientes**: Pueden crear solicitudes, recibir múltiples ofertas y seleccionar la mejor opción
- **Técnicos**: Pueden ofertar en solicitudes, aceptar trabajos y gestionar su calendario
- **Administradores**: Gestión completa del sistema, usuarios y parámetros

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular basada en NestJS con los siguientes módulos principales:

- **Identity Module**: Gestión de usuarios base con autenticación y perfiles
- **Auth Module**: Autenticación JWT, autorización y guards de seguridad
- **Client Module**: Funcionalidades específicas de clientes y gestión de solicitudes
- **Technician Module**: Funcionalidades específicas de técnicos y gestión de ofertas
- **Service Request Module**: Gestión completa de solicitudes y sistema multi-ofertas
- **Address Module**: Gestión de direcciones y ubicaciones de servicio
- **Appliance Module**: Catálogo de electrodomésticos, marcas y modelos
- **Rating Module**: Sistema de calificaciones y reputación
- **Notification Module**: Sistema de notificaciones en tiempo real con WebSockets

## 📊 Modelo de Datos

### Entidades Principales

- **Identity**: Usuario base con autenticación y información personal
- **Client**: Extensión de Identity para clientes con direcciones y solicitudes
- **Technician**: Extensión de Identity para técnicos con especialidades y calendario
- **ServiceRequest**: Solicitudes de servicio con fechas propuestas y sistema de expiración
- **ServiceRequestOffer**: Ofertas de técnicos en solicitudes específicas
- **Address**: Direcciones de servicio vinculadas a clientes
- **Appliance**: Catálogo completo de electrodomésticos con marcas y modelos
- **Rating**: Calificaciones de servicios completados
- **Notification**: Sistema de mensajería y notificaciones

### Estados de Solicitud de Servicio

- `pending`: Solicitud creada, esperando ofertas de técnicos
- `offered`: Al menos un técnico ha hecho una oferta
- `accepted`: Cliente acepta una oferta específica y se asigna técnico
- `scheduled`: Servicio programado con fecha y técnico confirmados
- `in_progress`: Servicio en ejecución por el técnico
- `completed`: Servicio completado y confirmado por el cliente
- `cancelled`: Solicitud cancelada por el cliente

### Sistema Multi-Ofertas

- **Ofertas Múltiples**: Varios técnicos pueden ofertar en la misma solicitud
- **Estados de Ofertas**: `pending`, `accepted`, `rejected`
- **Competencia de Precios**: Los técnicos compiten con diferentes precios y comentarios
- **Selección por Cliente**: El cliente elige la mejor oferta entre todas las recibidas

## 🚀 Tecnologías Utilizadas

- **Backend Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: PostgreSQL con TypeORM 0.3.x
- **Autenticación**: JWT + Passport
- **Validación**: Class Validator + Class Transformer
- **Documentación**: Swagger/OpenAPI
- **WebSockets**: Socket.IO para notificaciones en tiempo real
- **Almacenamiento**: Cloudinary para archivos e imágenes
- **Migraciones**: TypeORM CLI para control de esquema
- **Testing**: Jest para pruebas unitarias e integración
- **Linting**: ESLint + Prettier para calidad de código

## ⚙️ Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 13.x

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/MyHomeTech.git
cd MyHomeTech
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

Crear una base de datos PostgreSQL y configurar las variables de entorno:

```bash
# Crear archivo .env en la raíz del proyecto
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=myhometech_db

JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h
```

### 4. Ejecutar Migraciones

TypeORM creará automáticamente las tablas al iniciar la aplicación con `synchronize: true` en desarrollo.

Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 📚 Documentación de la API

Una vez que la aplicación esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

**[http://localhost:3000/docs](http://localhost:3000/docs)**

### 🔐 Endpoints de Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil del usuario autenticado

### 👤 Endpoints de Gestión de Usuarios

- `POST /identity/register` - Registrar nuevo usuario
- `GET /identity/profile` - Obtener perfil actual
- `PUT /identity/profile` - Actualizar perfil
- `POST /identity/admin/toggle-status/:id` - Activar/desactivar usuario (Admin)

### 🔧 Endpoints de Solicitudes de Servicio

#### Gestión de Solicitudes
- `GET /service-requests` - Listar solicitudes (con filtros por rol)
- `POST /service-requests` - Crear nueva solicitud con fecha propuesta
- `GET /service-requests/:id` - Obtener detalles de solicitud específica
- `PUT /service-requests/:id/update-price` - Actualizar precio de solicitud (Cliente)
- `PUT /service-requests/:id/cancel` - Cancelar solicitud (Cliente)
- `PUT /service-requests/:id/complete` - Marcar como completado (Cliente)

#### Sistema Multi-Ofertas
- `GET /service-requests/available-for-me` - Solicitudes disponibles para técnico
- `POST /service-requests/:id/offer` - Hacer oferta en solicitud (Técnico)
- `POST /service-requests/:id/accept-offer/:offerId` - Aceptar oferta específica (Cliente)
- `GET /service-requests/my-requests-with-offers` - Solicitudes del cliente con todas las ofertas

#### Gestión de Trabajos
- `POST /service-requests/:id/accept` - Aceptar solicitud directamente (Técnico)
- `PUT /service-requests/:id/start` - Iniciar servicio (Técnico)
- `PUT /service-requests/:id/complete` - Completar servicio (Técnico)

#### Calendario y Disponibilidad
- `GET /service-requests/calendar/technician/:id` - Calendario de técnico
- `GET /service-requests/calendar/client/:id` - Calendario de cliente
- `GET /service-requests/availability/check` - Verificar disponibilidad de técnico

### 🏠 Endpoints de Electrodomésticos

- `GET /appliances` - Listar electrodomésticos con filtros
- `POST /appliances` - Crear electrodoméstico (Admin)
- `GET /appliances/:id` - Obtener detalles específicos
- `PUT /appliances/:id` - Actualizar electrodoméstico (Admin)
- `DELETE /appliances/:id` - Eliminar electrodoméstico (Admin)

#### Gestión de Marcas y Modelos
- `GET /appliance-brands` - Listar marcas disponibles
- `GET /appliance-models` - Listar modelos por marca
- `GET /appliance-types` - Listar tipos de electrodomésticos

### 📍 Endpoints de Direcciones

- `GET /addresses/my-addresses` - Direcciones del usuario autenticado
- `POST /addresses` - Agregar nueva dirección
- `PUT /addresses/:id` - Actualizar dirección existente
- `DELETE /addresses/:id` - Eliminar dirección
- `PUT /addresses/:id/set-default` - Establecer dirección por defecto

### ⭐ Endpoints de Calificaciones

- `GET /ratings` - Listar calificaciones
- `POST /ratings` - Crear calificación (Cliente)
- `GET /ratings/technician/:id` - Calificaciones de técnico
- `GET /ratings/service-request/:id` - Calificación de servicio

### 📧 Endpoints de Notificaciones

- `GET /notifications` - Listar notificaciones del usuario
- `PUT /notifications/:id/read` - Marcar como leída
- `PUT /notifications/mark-all-read` - Marcar todas como leídas

### 🛠️ Autenticación

La API utiliza JWT Bearer tokens. Para acceder a endpoints protegidos:

1. Obtén un token mediante `POST /auth/login`
2. Incluye el token en el header Authorization: `Bearer <tu_token>`

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 📁 Estructura del Proyecto

```
src/
├── address/              # Módulo de gestión de direcciones
│   ├── address.controller.ts
│   ├── address.entity.ts
│   ├── address.service.ts
│   └── dto/
├── appliance/            # Módulo de electrodomésticos
│   ├── appliance.controller.ts
│   ├── appliance.entity.ts
│   ├── appliance.service.ts
│   └── dto/
├── appliance-brand/      # Gestión de marcas
├── appliance-model/      # Gestión de modelos
├── appliance-type/       # Tipos de electrodomésticos
├── auth/                 # Módulo de autenticación
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── dto/
│   └── jwt/
├── client/               # Módulo específico de clientes
├── common/               # Utilidades compartidas
│   ├── cloudinary.service.ts
│   ├── roles.decorator.ts
│   └── guards/
├── database/             # Configuración de BD y seeds
│   ├── data-source.ts
│   └── seed-appliance-structure.ts
├── identity/             # Módulo de gestión de usuarios
├── migrations/           # Migraciones de base de datos
├── notification/         # Sistema de notificaciones
├── rating/              # Módulo de calificaciones
├── service-request/     # Módulo principal de solicitudes
│   ├── service-request.controller.ts
│   ├── service-request.entity.ts
│   ├── service-request.service.ts
│   ├── service-request.gateway.ts
│   ├── service-request-offer.entity.ts
│   └── dto/
├── technician/          # Módulo específico de técnicos
├── types/               # Tipos y interfaces globales
├── app.module.ts        # Módulo principal de la aplicación
└── main.ts             # Punto de entrada de la aplicación
```

## 🔒 Seguridad

- **JWT Authentication**: Tokens seguros con expiración configurable
- **Role-Based Access Control**: Diferentes permisos por tipo de usuario
- **Password Hashing**: Contraseñas encriptadas con bcrypt
- **Request Validation**: Validación estricta de datos de entrada
- **CORS Configuration**: Configuración de CORS para diferentes entornos

## 🚀 Funcionalidades Clave

### Sistema Multi-Ofertas
1. **Cliente** crea una solicitud de servicio con fecha propuesta
2. **Múltiples Técnicos** pueden hacer ofertas competitivas con precios y comentarios
3. **Cliente** revisa todas las ofertas ordenadas cronológicamente
4. **Cliente** selecciona la mejor oferta y se asigna automáticamente el técnico
5. **Sistema** rechaza automáticamente las ofertas no seleccionadas

### Programación Inteligente
- **Validación de Disponibilidad**: Verificación automática de conflictos de horarios
- **Propuesta de Fechas**: Clientes proponen fechas específicas para el servicio
- **Ventana de Disponibilidad**: Sistema de 6 horas para evitar solapamientos
- **Calendario Integrado**: Visualización de horarios para técnicos y clientes

### Sistema de Notificaciones en Tiempo Real
- **WebSockets**: Conexiones persistentes para actualizaciones instantáneas
- **Notificaciones Dirigidas**: Mensajes específicos por rol y usuario
- **Estados de Lectura**: Control de notificaciones leídas/no leídas
- **Eventos del Sistema**: Notificaciones automáticas en cambios de estado

### Gestión de Calidad
- **Sistema de Calificaciones**: Solo servicios completados pueden ser calificados
- **Prevención de Duplicados**: Control de calificaciones múltiples
- **Promedio Automático**: Cálculo automático de reputación de técnicos
- **Historial Completo**: Registro de todas las interacciones del servicio

## 🔧 Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=myhometech_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo
JWT_EXPIRES_IN=24h

# Aplicación
PORT=3000
NODE_ENV=development
```

## 🧪 Testing

El proyecto incluye tests unitarios y de integración:

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

## 📈 Desarrollo y Contribución

### Estándares de Código

- **ESLint**: Linting de código TypeScript
- **Prettier**: Formateo automático de código
- **Husky**: Git hooks para validación pre-commit

### Comandos de Desarrollo

```bash
# Formatear código
npm run format

# Linting
npm run lint

# Build para producción
npm run build
```

## Deployment

## 🚀 Deployment

### Preparación para Producción

1. **Configurar variables de entorno de producción**
2. **Build de la aplicación**:
   ```bash
   npm run build
   ```
3. **Ejecutar en modo producción**:
   ```bash
   npm run start:prod
   ```

### Consideraciones de Producción

- Configurar `synchronize: false` en TypeORM para producción
- Usar variables de entorno seguras
- Configurar reverse proxy (nginx/Apache)
- Implementar logs apropiados
- Configurar monitoreo y alertas

### Deployment con Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🛠️ Solución de Problemas Comunes

### Error de Conexión a Base de Datos
- Verificar que PostgreSQL esté ejecutándose
- Validar credenciales en archivo `.env`
- Comprobar que la base de datos existe

### Errores de JWT
- Verificar que `JWT_SECRET` esté configurado
- Comprobar formato del token en headers

### Errores de TypeORM
- Verificar entidades y relaciones
- Comprobar sincronización de esquema

## 📝 Próximas Funcionalidades

- [ ] **Sistema de Pagos**: Integración con pasarelas de pago
- [ ] **Geolocalización**: Búsqueda de técnicos por proximidad
- [ ] **Chat en Tiempo Real**: Comunicación directa entre usuarios
- [ ] **Aplicación Móvil**: API optimizada para móviles
- [ ] **Reportes y Analytics**: Dashboard administrativo con métricas
- [ ] **Sistema de Garantías**: Gestión de garantías de servicio
- [ ] **Notificaciones Push**: Notificaciones móviles
- [ ] **Sistema de Inventario**: Gestión de repuestos y herramientas
- [ ] **Inteligencia Artificial**: Predicción de fallas y mantenimiento preventivo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`) 
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Equipo MyHomeTech**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: contact@myhometech.com

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - Framework backend increíble
- [TypeORM](https://typeorm.io/) - ORM para TypeScript
- [PostgreSQL](https://postgresql.org/) - Base de datos robusta
