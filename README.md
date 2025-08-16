# 🧠 Mind Mirror - Juego de IA Adaptativa

Mind Mirror es un juego innovador donde una IA aprende de tu estilo de juego en tiempo real, adaptándose continuamente para ofrecerte desafíos personalizados.

## 🎮 Características Principales

- **IA Adaptativa**: Motor de IA que aprende y se adapta a tu estilo de juego
- **Múltiples Personalidades de IA**: Mirror, Shadow, Hunter, Sage, Chameleon
- **Análisis en Tiempo Real**: Heatmaps, predicciones y análisis de patrones
- **Sistema de Progreso**: Logros, estadísticas y perfiles de jugador
- **Modo Offline**: Juega sin conexión, sincroniza cuando te conectes
- **Arquitectura Full-Stack**: Frontend React + Backend Express + PostgreSQL

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    MIND MIRROR ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────┐ │
│  │    Frontend     │    │    Backend      │    │Database │ │
│  │   React + TS    │◄──►│  Express + TS   │◄──►│PostgreSQL│ │
│  │                 │    │                 │    │Supabase │ │
│  │ • Game UI       │    │ • REST API      │    │         │ │
│  │ • AI Feedback   │    │ • Game Logic    │    │ • Games │ │
│  │ • Analytics     │    │ • AI Engine     │    │ • Players│ │
│  │ • Offline Mode  │    │ • Analytics     │    │ • AI Data│ │
│  └─────────────────┘    └─────────────────┘    └─────────┘ │
│           │                       │                        │
│  ┌───────────────��─┐    ┌─────────────────┐               │
│  │   Deployment    │    │   AI Services   │               │
│  │                 │    │                 │               │
│  │ • Netlify SPA   │    │ • Pattern Analyzer              │
│  │ • Serverless    │    │ • Decision Engine               │
│  │ • Auto Deploy   │    │ • Learning Module               │
│  │ • Edge Cache    │    │ • Personality System            │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/tuusuario/mind-mirror.git
cd mind-mirror

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar en modo desarrollo
npm run dev
```

### Con Base de Datos (Supabase)

```bash
# 1. Crear proyecto en Supabase
# 2. Ejecutar db/schema.sql en SQL Editor
# 3. Configurar .env con URL de Supabase
# 4. Ejecutar db/seeds.sql (opcional)

# 5. Verificar conexión
npm run dev
# Ir a http://localhost:8080/api/health
```

## 📁 Estructura del Proyecto

```
mind-mirror/
├── client/                 # Frontend React (legacy)
├── src/                   # Frontend React actualizado
│   ├── components/        # Componentes UI
│   ├── pages/            # Páginas/rutas
│   ├── services/         # Servicios API
│   ├── store/            # Estado global
│   └── core/             # Lógica del juego
├── server/               # Backend Express
│   ├── routes/           # Endpoints API
│   ├── services/         # Servicios de backend
│   └── index.ts          # Servidor principal
├── shared/               # Tipos compartidos
├── db/                   # Scripts de base de datos
│   ├── schema.sql        # Esquema PostgreSQL
│   └── seeds.sql         # Datos de prueba
├── netlify/              # Configuración Netlify
└── docs/                 # Documentación
```

## 🎯 Funcionalidades Implementadas

### ✅ Completado

- [x] **Sistema de IA Adaptativa**

  - [x] Motor de IA refactorizado con múltiples personalidades
  - [x] Análisis de patrones de jugador en tiempo real
  - [x] Sistema de aprendizaje y adaptación
  - [x] Predicciones de movimientos futuros

- [x] **Backend API Completa**

  - [x] Endpoints REST para jugadores, partidas y análisis
  - [x] Base de datos PostgreSQL con esquema completo
  - [x] Sistema de movimientos y análisis de IA
  - [x] Analytics y estadísticas avanzadas

- [x] **Frontend Integrado**

  - [x] Cliente API con modo offline
  - [x] Servicio de juego mejorado
  - [x] Integración con backend
  - [x] Manejo de conexión/desconexión

- [x] **Despliegue en Producción**
  - [x] Configuración para Netlify
  - [x] Funciones serverless
  - [x] Integración con Supabase
  - [x] Variables de entorno configuradas

### 🚧 En Desarrollo

- [ ] **Características Avanzadas de IA**

  - [ ] Modo Rule Breaker completo
  - [ ] Sistema de emociones de IA
  - [ ] Análisis predictivo avanzado

- [ ] **Funciones Sociales**

  - [ ] Multijugador
  - [ ] Torneos
  - [ ] Leaderboards globales

- [ ] **Análisis Avanzado**
  - [ ] Dashboard de estadísticas
  - [ ] Exportación de datos
  - [ ] Comparación de estilos de juego

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo full-stack
npm run build        # Build para producción
npm run preview      # Preview del build

# Testing
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch

# Base de datos
npm run db:reset    # Reset base de datos (desarrollo)
npm run db:seed     # Cargar datos de prueba

# Calidad de código
npm run lint        # Linting
npm run format      # Formatear código
npm run typecheck   # Verificar tipos TypeScript

# Despliegue
npm run deploy      # Deploy a Netlify
```

## 🔗 API Endpoints

### Jugadores

```
POST   /api/jugadores          # Crear jugador
GET    /api/jugadores/:id      # Obtener jugador
PUT    /api/jugadores/:id      # Actualizar jugador
GET    /api/jugadores/:id/historial    # Historial de partidas
GET    /api/jugadores/:id/analisis     # Análisis del jugador
```

### Partidas

```
POST   /api/partidas          # Crear partida
GET    /api/partidas/:id      # Obtener partida
POST   /api/partidas/:id/turno        # Realizar movimiento
POST   /api/partidas/:id/terminar     # Terminar partida
GET    /api/partidas/:id/analytics    # Analytics de partida
```

### Sistema

```
GET    /api/health            # Estado del sistema
GET    /api/config            # Configuración del sistema
POST   /api/ia/reset          # Reset datos de IA
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --grep "GameEngine"
npm test -- --grep "API"
```

## 🚀 Despliegue

### Netlify (Recomendado)

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía completa.

```bash
# Deploy rápido
npm run build
netlify deploy --prod --dir=dist/spa
```

### Variables de Entorno Requeridas

```bash
NODE_ENV=production
SUPABASE_DB_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de TypeScript existentes
- Añade tests para nuevas funcionalidades
- Actualiza documentación cuando sea necesario
- Mantén commits atómicos y descriptivos

## 📊 Tecnologías Utilizadas

### Frontend

- **React 18** - UI Library
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **TailwindCSS** - Styling
- **Radix UI** - Componentes base
- **Framer Motion** - Animaciones
- **Zustand** - State management

### Backend

- **Express** - Web framework
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos
- **Supabase** - BaaS platform
- **Serverless HTTP** - Netlify Functions

### DevOps & Tools

- **Netlify** - Hosting y CI/CD
- **Vitest** - Testing framework
- **ESLint** - Linting
- **Prettier** - Code formatting

## 📈 Roadmap

### V1.0 - Lanzamiento Inicial ✅

- [x] Juego básico funcional
- [x] IA adaptativa básica
- [x] Sistema de autenticación
- [x] Despliegue en producción

### V1.1 - Mejoras de IA 🚧

- [ ] Personalidades de IA avanzadas
- [ ] Análisis predictivo mejorado
- [ ] Sistema de dificultad dinámico

### V1.2 - Características Sociales

- [ ] Modo multijugador
- [ ] Sistema de ranking
- [ ] Compartir estadísticas

### V2.0 - Expansión del Juego

- [ ] Nuevos modos de juego
- [ ] Tableros personalizados
- [ ] Editor de reglas

## 🐛 Reportar Issues

Usa [GitHub Issues](https://github.com/tuusuario/mind-mirror/issues) para reportar bugs o sugerir nuevas características.

### Template de Bug Report

```
**Describe el bug**
Descripción clara del problema.

**Pasos para reproducir**
1. Ve a '...'
2. Haz click en '....'
3. Observa el error

**Comportamiento esperado**
¿Qué esperabas que pasara?

**Screenshots**
Si aplica, añade screenshots.

**Información del entorno**
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 22]
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollador Principal** - [Tu Nombre](https://github.com/tuusuario)
- **Diseño de IA** - Sistema de IA adaptativa
- **Arquitectura** - Full-stack TypeScript

## 🙏 Agradecimientos

- [Radix UI](https://www.radix-ui.com/) por los componentes base
- [Supabase](https://supabase.com/) por la plataforma de backend
- [Netlify](https://netlify.com/) por el hosting
- Comunidad open source por las herramientas increíbles

---

<div align="center">

**[🎮 Jugar Ahora](https://yourdomain.netlify.app)** •
**[📖 Documentación](./docs/)** •
**[🐛 Reportar Bug](https://github.com/tuusuario/mind-mirror/issues)** •
**[💡 Sugerir Feature](https://github.com/tuusuario/mind-mirror/issues)**

_Construido con ❤️ y mucha ☕_

</div>
