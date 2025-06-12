# My Home Tech - Monorepo

Este es un monorepo que contiene tanto el backend como el frontend de la aplicación My Home Tech - una plataforma completa de servicios de mantenimiento de electrodomésticos con dashboards modernos y funcionalidad completa.

## 🎯 Características Principales

### Dashboard-First Experience
- **Redirección Automática**: Los usuarios son dirigidos inmediatamente a su dashboard tras el login
- **Dashboards Personalizados**: Experiencias diferentes para clientes y técnicos
- **Navegación Lateral Moderna**: Sidebar profesional con branding e información del usuario
- **Header Contextual**: Se adapta al contenido del dashboard

### Para Clientes
- **Gestión de Solicitudes**: Ver y gestionar servicios solicitados
- **Sistema de Ofertas**: Aceptar o rechazar ofertas de técnicos
- **Seguimiento en Tiempo Real**: Estados actualizados de las solicitudes
- **Interfaz Intuitiva**: Diseño moderno con cards y filtros

### Para Técnicos
- **Trabajos Disponibles**: Explorar y ofertar en solicitudes de servicio
- **Mis Trabajos**: Gestionar trabajos asignados y su progreso
- **Sistema de Contraofertas**: Hacer contraofertas o aceptar precios directamente
- **Programación de Servicios**: Coordinar fechas con clientes

## 📁 Estructura del Proyecto

```
my-home-tech/
├── apps/
│   ├── backend/     # API NestJS con TypeORM y PostgreSQL
│   │   ├── src/
│   │   │   ├── auth/           # Sistema de autenticación JWT
│   │   │   ├── identity/       # Gestión de usuarios
│   │   │   ├── client/         # Módulo de clientes
│   │   │   ├── technician/     # Módulo de técnicos
│   │   │   ├── service-request/# Gestión de solicitudes
│   │   │   ├── appliance/      # Catálogo de electrodomésticos
│   │   │   ├── rating/         # Sistema de calificaciones
│   │   │   └── notification/   # Sistema de notificaciones
│   │   └── .env                # Variables de entorno
│   └── frontend/    # Aplicación React con Vite y Tailwind CSS
│       ├── src/
│       │   ├── components/
│       │   │   ├── dashboards/ # Dashboards de cliente y técnico
│       │   │   └── auth/       # Componentes de autenticación
│       │   ├── contexts/       # Contextos de React (Auth)
│       │   ├── services/       # Servicios de API
│       │   └── types/          # Tipos de TypeScript
│       └── public/
├── package.json     # Configuración del monorepo
├── README.md
└── DASHBOARD_IMPLEMENTATION.md  # Documentación detallada del dashboard
```

## Tecnologías

### Backend
- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Swagger** - Documentación de API

### Frontend  
- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Headless UI** - Componentes accesibles
- **Heroicons** - Iconos
- **Framer Motion** - Animaciones
- **Axios** - Cliente HTTP

## Comandos disponibles

### Desarrollo
```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend  
npm run dev:frontend
```

### Build
```bash
# Build completo
npm run build

# Solo backend
npm run build:backend

# Solo frontend
npm run build:frontend
```

### Linting
```bash
# Lint completo
npm run lint

# Solo backend
npm run lint:backend

# Solo frontend
npm run lint:frontend
```

### Testing
```bash
# Ejecutar tests del backend
npm run test
```

## Instalación

1. Instalar todas las dependencias:
```bash
npm install
```

2. Configurar variables de entorno para el backend (crear `apps/backend/.env`)

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

## URLs de desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api

## Workspaces

Este proyecto usa npm workspaces para manejar dependencias compartidas entre backend y frontend. Cada aplicación mantiene sus propias dependencias específicas mientras comparte las dependencias comunes a nivel raíz.
