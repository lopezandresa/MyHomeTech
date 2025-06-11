# MyHomeTech - API Backend

API Backend para plataforma de servicios de mantenimiento de electrodomésticos desarrollada con NestJS, TypeScript y PostgreSQL.

## 📋 Descripción

MyHomeTech es una aplicación web que conecta clientes que necesitan servicios de mantenimiento de electrodomésticos con técnicos especializados. El sistema permite solicitar, gestionar y calificar servicios de manera rápida y eficiente.

### ✨ Características Principales

- **Sistema de Autenticación JWT** con roles diferenciados
- **Gestión de Usuarios** (Clientes, Técnicos, Administradores)
- **Solicitudes de Servicio** con sistema de ofertas/contraofertas
- **Sistema de Calificaciones** al finalizar servicios
- **Notificaciones** en tiempo real
- **Gestión de Electrodomésticos** y especialidades técnicas
- **API RESTful** completamente documentada con Swagger
- **Control de Acceso Basado en Roles** (RBAC)
- **Base de Datos PostgreSQL** con TypeORM

### 👥 Tipos de Usuario

- **Clientes**: Pueden solicitar servicios, aceptar ofertas y calificar técnicos
- **Técnicos**: Pueden ver solicitudes, hacer contraofertas, aceptar trabajos
- **Administradores**: Gestión completa del sistema y usuarios

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular basada en NestJS con los siguientes módulos:

- **Identity Module**: Gestión de usuarios base
- **Auth Module**: Autenticación JWT y autorización
- **Client Module**: Funcionalidades específicas de clientes
- **Technician Module**: Funcionalidades específicas de técnicos
- **Service Request Module**: Gestión de solicitudes de servicio
- **Appliance Module**: Gestión de electrodomésticos
- **Rating Module**: Sistema de calificaciones
- **Notification Module**: Sistema de notificaciones

## 📊 Modelo de Datos

### Entidades Principales

- **Identity**: Usuario base con autenticación
- **Client**: Extensión de Identity para clientes
- **Technician**: Extensión de Identity para técnicos
- **ServiceRequest**: Solicitudes de servicio con estados
- **Appliance**: Catálogo de electrodomésticos
- **Rating**: Calificaciones de servicios completados
- **Notification**: Sistema de mensajería

### Estados de Solicitud de Servicio

- `pending`: Solicitud creada, esperando ofertas
- `offered`: Técnico ha hecho una oferta
- `accepted`: Cliente acepta la oferta
- `scheduled`: Servicio programado
- `in_progress`: Servicio en progreso
- `completed`: Servicio completado
- `cancelled`: Solicitud cancelada

## 🚀 Tecnologías Utilizadas

- **Backend Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM 0.3.x
- **Autenticación**: JWT + Passport
- **Validación**: Class Validator + Class Transformer
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Linting**: ESLint + Prettier

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

- `GET /service-requests` - Listar solicitudes (con filtros por rol)
- `POST /service-requests` - Crear nueva solicitud (Cliente)
- `GET /service-requests/:id` - Obtener detalles de solicitud
- `PUT /service-requests/:id/offer` - Hacer oferta (Técnico)
- `PUT /service-requests/:id/counter-offer` - Hacer contraoferta (Técnico)
- `PUT /service-requests/:id/accept` - Aceptar oferta (Cliente)
- `PUT /service-requests/:id/reject` - Rechazar oferta (Cliente)
- `PUT /service-requests/:id/schedule` - Programar servicio (Técnico)
- `PUT /service-requests/:id/start` - Iniciar servicio (Técnico)
- `PUT /service-requests/:id/complete` - Completar servicio (Técnico)
- `PUT /service-requests/:id/complete-by-client` - Confirmar completado (Cliente)
- `PUT /service-requests/:id/cancel` - Cancelar solicitud

### 🏠 Endpoints de Electrodomésticos

- `GET /appliances` - Listar electrodomésticos
- `POST /appliances` - Crear electrodoméstico (Admin)
- `GET /appliances/:id` - Obtener detalles
- `PUT /appliances/:id` - Actualizar electrodoméstico (Admin)
- `DELETE /appliances/:id` - Eliminar electrodoméstico (Admin)

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
├── appliance/           # Módulo de electrodomésticos
├── auth/               # Módulo de autenticación
├── client/             # Módulo específico de clientes
├── common/             # Utilidades compartidas
│   ├── decorators/     # Decoradores personalizados
│   ├── guards/         # Guards de autorización
│   └── pipes/          # Pipes de validación
├── identity/           # Módulo de gestión de usuarios
├── notification/       # Módulo de notificaciones
├── rating/            # Módulo de calificaciones
├── service-request/   # Módulo de solicitudes de servicio
├── technician/        # Módulo específico de técnicos
├── app.module.ts      # Módulo principal
└── main.ts           # Punto de entrada
```

## 🔒 Seguridad

- **JWT Authentication**: Tokens seguros con expiración configurable
- **Role-Based Access Control**: Diferentes permisos por tipo de usuario
- **Password Hashing**: Contraseñas encriptadas con bcrypt
- **Request Validation**: Validación estricta de datos de entrada
- **CORS Configuration**: Configuración de CORS para diferentes entornos

## 🚀 Funcionalidades Clave

### Flujo de Trabajo de Servicios

1. **Cliente** crea una solicitud de servicio
2. **Técnicos** pueden ver solicitudes pendientes y hacer ofertas
3. **Cliente** recibe notificaciones y puede aceptar/rechazar ofertas
4. **Técnico** programa y ejecuta el servicio
5. **Cliente** confirma la finalización y califica el servicio

### Sistema de Notificaciones

- Notificaciones automáticas en cada cambio de estado
- Historial completo de comunicaciones
- Marcado de leído/no leído

### Sistema de Calificaciones

- Solo se pueden calificar servicios completados
- Prevención de calificaciones duplicadas
- Promedio automático de calificaciones por técnico

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

- [ ] Sistema de archivos/fotos para técnicos
- [ ] Notificaciones push en tiempo real
- [ ] Sistema de pagos integrado
- [ ] Chat en tiempo real entre usuarios
- [ ] Sistema de reportes y analytics
- [ ] API para aplicación móvil
- [ ] Sistema de geolocalización

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
