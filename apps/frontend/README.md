# Home Tech Frontend 🏠⚡

Una moderna aplicación web para la plataforma de automatización doméstica Home Tech, construida con React, TypeScript y Vite.

## 🎨 Características del Diseño

- **Landing Page Atractiva**: Diseño moderno y responsivo con paleta de colores azul
- **Animaciones Suaves**: Implementadas con Framer Motion para una experiencia fluida
- **Responsive Design**: Optimizado para todos los dispositivos (móvil, tablet, escritorio)
- **Componentes Modulares**: Arquitectura limpia y mantenible

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **Framer Motion** - Biblioteca de animaciones
- **Heroicons** - Iconos modernos
- **Axios** - Cliente HTTP para APIs

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
├── components/           # Componentes reutilizables
│   ├── Header.tsx       # Navegación principal
│   ├── Hero.tsx         # Sección hero de la landing
│   ├── Features.tsx     # Características del producto
│   ├── About.tsx        # Información de la empresa
│   ├── Contact.tsx      # Formulario de contacto
│   └── Footer.tsx       # Pie de página
├── App.tsx              # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales con Tailwind
```

## 🎯 Secciones de la Landing Page

### 🏠 Header
- Navegación responsive con menú móvil
- Logo y enlaces de navegación
- Botón de llamada a la acción

### 🚀 Hero Section
- Título principal con gradientes atractivos
- Descripción del producto
- Botones de acción principales
- Estadísticas clave
- Indicador de scroll animado

### ⚡ Features
- Grid de características del producto
- Iconos animados con efectos hover
- Diseño tipo tarjeta con sombras

### 🏢 About
- Información de la empresa
- Lista de beneficios con checkmarks
- Estadísticas de la empresa
- Imagen placeholder con elementos flotantes

### 📞 Contact
- Formulario de contacto funcional
- Información de contacto
- Horarios de atención
- Estados de loading y éxito/error

### 📄 Footer
- Enlaces organizados por categorías
- Redes sociales
- Suscripción a newsletter
- Información legal

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores azul personalizada:

- **Primary Blue**: `#3b82f6` - `#1e3a8a`
- **Secondary Blue**: `#0ea5e9` - `#082f49`
- **Gradientes**: Combinaciones suaves entre tonos azules
- **Neutros**: Grises para texto y fondos

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

## 🌐 Integración con API

El frontend está preparado para conectarse con la API backend en `http://localhost:3000/docs`. Para implementar las integraciones:

1. Revisa la documentación Swagger en el endpoint mencionado
2. Utiliza Axios configurado para realizar peticiones HTTP
3. Implementa manejo de errores y estados de carga

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componentes Adaptables**: Todos los componentes se ajustan automáticamente

## 🚀 Deployment

Para desplegar la aplicación:

1. Construye el proyecto:
```bash
npm run build
```

2. Los archivos se generarán en la carpeta `dist/`
3. Despliega el contenido de `dist/` en tu servidor web

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Home Tech** - Transformando hogares con tecnología inteligente 🏠⚡
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
