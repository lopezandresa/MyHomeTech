/**
 * @fileoverview README principal del monorepo MyHomeTech
 * 
 * @description Documentación principal del proyecto que incluye:
 * - Descripción general de la plataforma
 * - Características principales y funcionalidades
 * - Guía de instalación y configuración
 * - Estructura del proyecto y tecnologías
 * - Comandos de desarrollo y producción
 * - Documentación JSDoc implementada
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

# MyHomeTech - Plataforma de Servicios Técnicos 🏠⚡

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Plataforma completa de servicios de mantenimiento de electrodomésticos que conecta clientes con técnicos especializados. Construida con **NestJS**, **React 19**, **TypeScript** y **PostgreSQL**.

## ✨ Características Principales

### 🎯 Dashboard-First Experience
- **Redirección Automática**: Login directo a dashboards personalizados
- **Experiencias Diferenciadas**: Dashboards especializados para clientes y técnicos
- **Navegación Moderna**: Sidebar profesional con branding e información contextual
- **Header Adaptativo**: Se ajusta dinámicamente al contenido actual

### 👨‍💼 Para Clientes
- **Gestión Completa de Solicitudes**: Crear, ver y gestionar servicios solicitados
- **Sistema Multi-Ofertas**: Recibir y comparar múltiples ofertas de técnicos
- **Seguimiento en Tiempo Real**: Estados actualizados instantáneamente vía WebSocket
- **Interfaz Intuitiva**: Cards modernas con filtros avanzados y búsqueda
- **Gestión de Direcciones**: Múltiples direcciones de servicio
- **Sistema de Calificaciones**: Evaluar y comentar servicios recibidos

### 👨‍🔧 Para Técnicos
- **Trabajos Disponibles**: Explorar solicitudes filtradas por especialidad
- **Sistema de Ofertas Competitivas**: Hacer contraofertas con comentarios
- **Programación Inteligente**: Verificación automática de disponibilidad
- **Mis Trabajos**: Gestión completa de trabajos asignados
- **Propuestas de Fechas**: Sistema de fechas alternativas con cliente
- **Validación de Conflictos**: Prevención automática de solapamientos

### 🔧 Funcionalidades Avanzadas
- **Notificaciones en Tiempo Real**: WebSocket para actualizaciones instantáneas
- **Calendario Integrado**: Gestión de disponibilidad para técnicos y clientes
- **Sistema de Ayuda**: Tickets de soporte y cancelaciones
- **Administración Completa**: Panel admin para gestión del sistema
- **Autenticación JWT**: Sistema seguro con roles diferenciados
- **API RESTful**: Completamente documentada con Swagger

## 📚 Documentación JSDoc

Este proyecto incluye **documentación JSDoc completa y profesional**:

### 📖 Cobertura de Documentación
- ✅ **Backend**: Todos los controladores, servicios y entidades documentados
- ✅ **Frontend**: Componentes, hooks, servicios y contextos documentados  
- ✅ **Interfaces TypeScript**: Más de 50 interfaces completamente documentadas
- ✅ **APIs**: Endpoints con ejemplos de request/response
- ✅ **Ejemplos Funcionales**: Código real en todas las funciones

### 🔍 Archivos de Documentación
- [`apps/backend/DOCUMENTATION.md`](apps/backend/DOCUMENTATION.md) - Documentación completa del backend
- [`apps/frontend/DOCUMENTATION.md`](apps/frontend/DOCUMENTATION.md) - Documentación completa del frontend
- **IntelliSense Mejorado**: Autocompletado con descripciones en VSCode
- **Tooltips Informativos**: Documentación integrada en el editor

## 🏗️ Arquitectura del Sistema

### Backend (NestJS)
```
src/
├── auth/              # 🔐 Autenticación JWT y autorización
├── identity/          # 👤 Gestión de usuarios base
├── client/            # 🏠 Funcionalidades específicas de clientes
├── technician/        # 🔧 Funcionalidades específicas de técnicos
├── service-request/   # 📋 Sistema completo de solicitudes y ofertas
├── appliance/         # 🏠 Catálogo de electrodomésticos
├── address/           # 📍 Gestión de direcciones de servicio
├── rating/            # ⭐ Sistema de calificaciones y reputación
├── notification/      # 📧 Notificaciones en tiempo real (WebSocket)
├── help-ticket/       # 🎫 Sistema de tickets de ayuda
└── common/            # 🛠️ Servicios compartidos (Cloudinary, Guards)
```

### Frontend (React)
```
src/
├── components/
│   ├── dashboards/    # 📊 Dashboards especializados
│   ├── auth/          # 🔐 Componentes de autenticación
│   ├── layout/        # 🎨 Layout y navegación
│   └── common/        # 🧩 Componentes reutilizables
├── contexts/          # 🔄 Contextos de React (Auth, Toast)
├── services/          # 🌐 Servicios de API con Axios
├── hooks/             # 🎣 Hooks personalizados
├── types/             # 📝 Definiciones TypeScript completas
├── utils/             # 🛠️ Utilidades y helpers
└── pages/             # 📄 Páginas principales
```

## 🚀 Tecnologías

### Backend Stack
- **[NestJS 11.x](https://nestjs.com/)** - Framework de Node.js empresarial
- **[TypeORM 0.3.x](https://typeorm.io/)** - ORM con soporte completo para PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[JWT + Passport](https://www.passportjs.org/)** - Autenticación y autorización
- **[Swagger/OpenAPI](https://swagger.io/)** - Documentación automática de API
- **[Socket.IO](https://socket.io/)** - WebSockets para tiempo real
- **[Cloudinary](https://cloudinary.com/)** - Gestión de imágenes y archivos
- **[Class Validator](https://github.com/typestack/class-validator)** - Validación de DTOs

### Frontend Stack  
- **[React 19](https://react.dev/)** - Framework de UI con nuevos hooks
- **[Vite 6](https://vitejs.dev/)** - Build tool ultrarrápido con HMR
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Tipado estático avanzado
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de CSS utilitario
- **[Headless UI](https://headlessui.com/)** - Componentes accesibles
- **[Heroicons](https://heroicons.com/)** + **[Lucide React](https://lucide.dev/)** - Iconos modernos
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones fluidas
- **[Axios](https://axios-http.com/)** - Cliente HTTP con interceptores
- **[Socket.IO Client](https://socket.io/)** - WebSockets del lado cliente

## ⚡ Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ y **npm** 9+
- **PostgreSQL** 14+ (local o en la nube)
- **Git** para clonar el repositorio

### 1. Clonar y Configurar
```bash
# Clonar el repositorio
git clone <repository-url>
cd my-home-tech-backend

# Instalar todas las dependencias
npm install
```

### 2. Configuración de Base de Datos
```bash
# Crear archivo de variables de entorno
cp apps/backend/dev.environments apps/backend/.env

# Editar el archivo .env con tus datos de PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=tu_usuario
# DB_PASS=tu_contraseña
# DB_NAME=myhometech_db
```

### 3. Inicializar Base de Datos
```bash
# Ejecutar migraciones y seeds
cd apps/backend
npm run seed
```

## 🖥️ Comandos de Desarrollo

### Desarrollo Paralelo
```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# API Docs: http://localhost:3000/docs
```

### Desarrollo Individual
```bash
# Solo backend (NestJS + PostgreSQL)
npm run dev:backend

# Solo frontend (React + Vite)  
npm run dev:frontend
```

### Build y Producción
```bash
# Build completo (backend + frontend)
npm run build

# Build individual
npm run build:backend
npm run build:frontend

# Ejecutar en producción
npm run start:prod
```

### Calidad de Código
```bash
# Linting completo
npm run lint

# Linting con fix automático
npm run lint:fix

# Testing (backend)
npm run test

# Coverage de tests
npm run test:cov
```

## 🌐 URLs y Endpoints

### Desarrollo
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Swagger Docs**: [http://localhost:3000/docs](http://localhost:3000/docs)

### API Endpoints Principales
- `POST /api/auth/login` - Autenticación de usuarios
- `GET /api/service-requests/pending` - Solicitudes pendientes (técnicos)
- `POST /api/service-requests` - Crear nueva solicitud (clientes)
- `GET /api/service-requests/my-requests` - Solicitudes del cliente
- `POST /api/service-requests/:id/accept` - Aceptar solicitud (técnicos)
- `GET /api/appliances` - Catálogo de electrodomésticos
- `GET /api/identity/me` - Perfil del usuario actual

## 📊 Características del Sistema

### 🔒 Seguridad
- **JWT Authentication**: Tokens seguros con expiración configurable
- **Role-Based Access Control**: Permisos diferenciados (Cliente, Técnico, Admin)
- **Password Hashing**: Contraseñas encriptadas con bcrypt
- **Input Validation**: Validación estricta con Class Validator
- **CORS Configuration**: Configuración segura para diferentes entornos

### ⚡ Rendimiento
- **Lazy Loading**: Carga diferida de componentes React
- **Database Indexing**: Índices optimizados en PostgreSQL
- **Parallel Notifications**: Notificaciones WebSocket optimizadas
- **Image Optimization**: Cloudinary para manejo eficiente de imágenes
- **Caching Strategy**: Caché de API con Axios interceptors

### 🔄 Tiempo Real
- **WebSocket Integration**: Socket.IO para notificaciones instantáneas
- **Event-Driven Updates**: Estados sincronizados automáticamente
- **Real-time Availability**: Verificación de disponibilidad en vivo
- **Live Status Changes**: Actualizaciones de estado inmediatas

## 🎯 Flujo de Uso

### Para Clientes
1. **Registro/Login** → Dashboard personalizado
2. **Crear Solicitud** → Seleccionar electrodoméstico, dirección y fecha
3. **Recibir Ofertas** → Técnicos envían propuestas automáticamente
4. **Aceptar/Negociar** → Comparar ofertas y fechas alternativas
5. **Seguimiento** → Estado en tiempo real hasta completar servicio
6. **Calificar** → Evaluar el servicio recibido

### Para Técnicos
1. **Registro/Login** → Dashboard con trabajos disponibles
2. **Explorar Solicitudes** → Filtradas por especialidad y disponibilidad
3. **Hacer Ofertas** → Aceptar precio o proponer alternativas
4. **Programar Servicios** → Coordinar fechas con verificación automática
5. **Gestionar Trabajos** → Seguimiento de servicios asignados
6. **Completar Servicios** → Marcar como finalizados

## 🛠️ Workspaces y Gestión

Este proyecto utiliza **npm workspaces** para:
- **Dependencias Compartidas**: TypeScript, ESLint, etc.
- **Comandos Unificados**: Scripts que funcionan en ambos proyectos
- **Builds Optimizados**: Compilación paralela y eficiente
- **Desarrollo Sincronizado**: Hot reload en frontend y backend

## 📈 Roadmap y Futuras Funcionalidades

### En Desarrollo
- [ ] **Pagos Integrados**: Pasarela de pagos con Stripe/PayU
- [ ] **Geolocalización**: Filtrado por proximidad geográfica
- [ ] **Chat en Tiempo Real**: Comunicación directa cliente-técnico
- [ ] **App Móvil**: Aplicación nativa con React Native

### Planificadas
- [ ] **Analytics Dashboard**: Métricas de negocio para administradores
- [ ] **AI Recommendations**: Sugerencias inteligentes de técnicos
- [ ] **Multi-idioma**: Soporte para internacionalización
- [ ] **API Pública**: SDK para integraciones de terceros

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

### Estándares de Código
- **ESLint + Prettier**: Configuración estricta aplicada
- **TypeScript**: Tipado estricto en todo el proyecto
- **JSDoc**: Documentación obligatoria en funciones públicas
- **Testing**: Tests unitarios para servicios críticos
- **Conventional Commits**: Formato estándar de commits

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollo Backend**: Especialistas en NestJS y PostgreSQL
- **Desarrollo Frontend**: Expertos en React y TypeScript  
- **DevOps**: Configuración y deployment
- **QA**: Testing y calidad de código

---

**MyHomeTech** - Conectando hogares con tecnología inteligente 🏠⚡

<div align="center">
  <strong>¿Preguntas? ¿Sugerencias?</strong><br>
  📧 Contacta al equipo de desarrollo
</div>
