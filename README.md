# My Home Tech - Monorepo

Este es un monorepo que contiene tanto el backend como el frontend de la aplicación My Home Tech.

## Estructura del proyecto

```
my-home-tech/
├── apps/
│   ├── backend/     # API NestJS con TypeORM y PostgreSQL
│   └── frontend/    # Aplicación React con Vite y Tailwind CSS
├── package.json     # Configuración del monorepo
└── README.md
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
