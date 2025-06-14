# MyHomeTech Frontend 🏠⚡

Aplicación web moderna para la plataforma MyHomeTech de servicios de mantenimiento de electrodomésticos, construida con React 19, TypeScript y Vite.

## 🎨 Características del Frontend

### Dashboard-First Experience
- **Redirección Automática**: Login directo a dashboards personalizados
- **Dashboards Especializados**: Experiencias diferenciadas para clientes y técnicos
- **Navegación Lateral Moderna**: Sidebar profesional con información contextual
- **Header Adaptativo**: Se ajusta dinámicamente al contenido actual

### Para Clientes
- **Gestión de Solicitudes**: Crear, ver y gestionar servicios solicitados
- **Sistema Multi-Ofertas**: Recibir y comparar múltiples ofertas de técnicos
- **Seguimiento en Tiempo Real**: Estados actualizados instantáneamente
- **Interfaz Intuitiva**: Cards modernas con filtros y búsqueda
- **Gestión de Direcciones**: Múltiples direcciones de servicio

### Para Técnicos
- **Trabajos Disponibles**: Explorar solicitudes y hacer ofertas competitivas
- **Mis Trabajos**: Gestionar trabajos asignados y calendario
- **Sistema de Ofertas**: Hacer contraofertas con comentarios personalizados
- **Programación**: Coordinar fechas y horarios con clientes
- **Validación de Disponibilidad**: Verificación automática de conflictos

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework de interfaz de usuario con nuevos hooks
- **TypeScript** - Tipado estático para mayor seguridad
- **Vite 6** - Build tool ultrarrápido con HMR
- **Tailwind CSS** - Framework de CSS utilitario para diseño moderno
- **Headless UI** - Componentes accesibles sin estilos predefinidos
- **Heroicons & Lucide React** - Librerías de iconos modernas
- **Framer Motion** - Animaciones fluidas y profesionales
- **Axios** - Cliente HTTP para comunicación con API
- **Socket.IO Client** - WebSockets para actualizaciones en tiempo real
- **Date-fns** - Manipulación de fechas

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd my-home-tech-frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── auth/               # Componentes de autenticación
│   │   ├── LoginForm.tsx   # Formulario de login
│   │   ├── RegisterForm.tsx # Formulario de registro
│   │   └── ServiceRequestModal.tsx # Modal de solicitud de servicio
│   ├── dashboards/         # Dashboards especializados
│   │   ├── ClientDashboard.tsx # Dashboard completo de clientes
│   │   ├── TechnicianDashboard.tsx # Dashboard completo de técnicos
│   │   ├── ClientRequests.tsx # Gestión de solicitudes de clientes
│   │   ├── TechnicianRequests.tsx # Gestión de trabajos de técnicos
│   │   └── MyRequests.tsx  # Vista unificada de solicitudes
│   ├── layout/             # Componentes de diseño
│   │   ├── Header.tsx      # Header adaptativo
│   │   ├── Sidebar.tsx     # Navegación lateral
│   │   └── Layout.tsx      # Layout principal
│   ├── ServiceRequestForm.tsx # Formulario avanzado de solicitudes
│   ├── ServiceRequestModal.tsx # Modal de solicitudes
│   └── landing/            # Componentes de landing page
│       ├── Hero.tsx        # Sección hero
│       ├── Features.tsx    # Características del producto
│       ├── About.tsx       # Información de la empresa
│       ├── Contact.tsx     # Formulario de contacto
│       └── Footer.tsx      # Pie de página
├── contexts/               # Contextos de React
│   └── AuthContext.tsx     # Context de autenticación
├── hooks/                  # Hooks personalizados
│   ├── useAuth.ts          # Hook de autenticación
│   ├── useNotifications.ts # Hook de notificaciones
│   └── useDashboardActions.ts # Hook de acciones del dashboard
├── services/               # Servicios de API
│   ├── api.ts              # Configuración base de Axios
│   ├── authService.ts      # Servicio de autenticación
│   ├── serviceRequestService.ts # Servicio de solicitudes
│   ├── applianceService.ts # Servicio de electrodomésticos
│   └── addressService.ts   # Servicio de direcciones
├── types/                  # Tipos TypeScript
│   └── index.ts            # Definiciones de tipos globales
├── utils/                  # Utilidades
│   └── dateUtils.ts        # Funciones de manipulación de fechas
├── App.tsx                 # Componente principal
├── main.tsx               # Punto de entrada
└── index.css              # Estilos globales con Tailwind
```

## 🎯 Funcionalidades Principales

### 🏠 Landing Page
- **Hero Section**: Presentación atractiva con call-to-actions
- **Características**: Grid de funcionalidades con iconos animados
- **Información Empresarial**: Sección sobre la empresa y beneficios
- **Formulario de Contacto**: Contacto funcional con validación
- **Footer Completo**: Enlaces organizados y redes sociales

### � Sistema de Autenticación
- **Login/Registro**: Formularios con validación completa
- **Roles Diferenciados**: Redirección automática según tipo de usuario
- **Persistencia de Sesión**: Mantenimiento de estado entre sesiones
- **Protección de Rutas**: Acceso controlado a secciones privadas

### 👨‍💼 Dashboard de Clientes
- **Mis Solicitudes**: Vista completa de servicios solicitados
  - Estados en tiempo real con colores distintivos
  - Sistema multi-ofertas con comparación de precios
  - Aceptación individual de ofertas específicas
  - Cancelación de solicitudes completas
- **Nueva Solicitud**: Formulario avanzado de creación
  - Selección de electrodoméstico por tipo, marca y modelo
  - Gestión de múltiples direcciones de servicio
  - Propuesta de fechas y horarios específicos
  - Validación de horarios de trabajo (6 AM - 6 PM)
- **Mi Perfil**: Gestión de información personal y direcciones

### 👨‍� Dashboard de Técnicos
- **Trabajos Disponibles**: Lista de solicitudes abiertas
  - Filtrado por especialidad y disponibilidad
  - Información completa del cliente y servicio
  - Sistema de ofertas competitivas con comentarios
  - Aceptación directa de precios propuestos
- **Mis Trabajos**: Gestión de trabajos asignados
  - Calendario de servicios programados
  - Estados de progreso actualizables
  - Información detallada de cada trabajo
- **Mi Perfil**: Gestión de especialidades y información profesional

## 🔄 Actualizaciones en Tiempo Real

### WebSocket Integration
- **Conexión Persistente**: Comunicación bidireccional con el servidor
- **Notificaciones Instantáneas**: Alertas inmediatas de nuevas ofertas
- **Estados Sincronizados**: Actualización automática de UI
- **Reconexión Automática**: Manejo robusto de desconexiones

### Sistema Multi-Ofertas
- **Ofertas Competitivas**: Múltiples técnicos pueden ofertar simultáneamente
- **Comparación Visual**: Interfaz clara para comparar ofertas
- **Selección Individual**: Aceptar ofertas específicas con un click
- **Información de Técnicos**: Datos del técnico y calificaciones por oferta

## 🎨 Diseño y UX

### Paleta de Colores
- **Primary Blue**: `#3b82f6` - `#1e3a8a` para elementos principales
- **Secondary Blue**: `#0ea5e9` - `#082f49` para acentos
- **Success Green**: Para estados positivos y confirmaciones
- **Warning Amber**: Para alertas y estados pendientes
- **Error Red**: Para errores y estados críticos
- **Neutral Grays**: Para texto y fondos

### Responsive Design
- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints Tailwind**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componentes Adaptativos**: Todos los elementos se ajustan automáticamente
- **Navegación Móvil**: Menús colapsables y touch-friendly

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Preview de la construcción
npm run preview

# Linting
npm run lint
```

## 🌐 Integración con API Backend

### Servicios de API
- **Configuración Centralizada**: Cliente Axios con interceptores
- **Autenticación JWT**: Manejo automático de tokens
- **Error Handling**: Gestión centralizada de errores de API
- **Loading States**: Estados de carga para mejor UX

### Endpoints Principales
- **Autenticación**: Login, registro y gestión de sesiones
- **Solicitudes de Servicio**: CRUD completo con sistema multi-ofertas
- **Gestión de Usuarios**: Perfiles de clientes y técnicos
- **Electrodomésticos**: Catálogo completo con filtros
- **Direcciones**: Gestión de ubicaciones de servicio
- **Calificaciones**: Sistema de reputación y feedback

### Real-time Features
- **Socket.IO Client**: Comunicación en tiempo real
- **Event Handling**: Manejo de eventos del servidor
- **State Synchronization**: Sincronización automática de estados
- **Offline Support**: Manejo de estados sin conexión

## 📱 Responsive Design

### Breakpoints y Adaptabilidad
- **Mobile First**: Diseño optimizado para móviles desde el inicio
- **Breakpoints Estándar**: 
  - `sm`: 640px - Teléfonos en landscape
  - `md`: 768px - Tablets
  - `lg`: 1024px - Laptops
  - `xl`: 1280px+ - Monitores grandes
- **Componentes Fluidos**: Todos los elementos se adaptan automáticamente
- **Tipografía Escalable**: Tamaños de texto que se ajustan por dispositivo

### Optimizaciones Móviles
- **Touch Targets**: Botones y enlaces con tamaño mínimo de 44px
- **Navegación Táctil**: Gestos y controles optimizados para touch
- **Carga Progresiva**: Lazy loading de imágenes y componentes
- **Rendimiento**: Optimizado para conexiones lentas

## 🚀 Deployment y Producción

### Build para Producción
```bash
# Construir la aplicación
npm run build

# Preview del build
npm run preview
```

### Configuraciones de Producción
- **Optimización de Bundle**: Tree shaking y code splitting automático
- **Compresión de Assets**: Minificación de CSS, JS e imágenes
- **Service Workers**: Cache strategies para mejor rendimiento offline
- **CDN Ready**: Assets optimizados para distribución global

### Variables de Entorno
```env
# API Backend URL
VITE_API_URL=https://api.myhometech.com

# WebSocket URL
VITE_WS_URL=wss://api.myhometech.com

# Environment
VITE_NODE_ENV=production
```

### Deployment Options
- **Static Hosting**: Vercel, Netlify, GitHub Pages
- **Docker**: Containerización para deployment escalable
- **CDN Integration**: CloudFront, CloudFlare para distribución global

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔮 Próximas Funcionalidades

### Funcionalidades en Desarrollo
- [ ] **Chat en Tiempo Real**: Comunicación directa cliente-técnico
- [ ] **Notificaciones Push**: Notificaciones del navegador
- [ ] **PWA Support**: Instalación como aplicación nativa
- [ ] **Cámara Integration**: Foto de problemas y progreso
- [ ] **Geolocalización**: Mapas y ubicación de técnicos

### Mejoras de UX/UI
- [ ] **Dark Mode**: Tema oscuro para mejor usabilidad nocturna
- [ ] **Personalización**: Temas y configuraciones por usuario
- [ ] **Accesibilidad**: Cumplimiento WCAG 2.1 AA
- [ ] **Internacionalización**: Soporte multi-idioma
- [ ] **Animaciones Avanzadas**: Micro-interacciones y transiciones

### Funcionalidades Técnicas
- [ ] **Offline Support**: Funcionalidad sin conexión
- [ ] **Analytics Integration**: Métricas de uso y rendimiento
- [ ] **Error Boundary**: Manejo robusto de errores
- [ ] **Testing Suite**: Tests unitarios y de integración
- [ ] **Performance Monitoring**: Monitoreo de rendimiento en producción

---

**MyHomeTech Frontend** - Conectando hogares con tecnología inteligente 🏠⚡
