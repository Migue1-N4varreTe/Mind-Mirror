# Mind Mirror - Juego Web Interactivo

Una aplicación web de juego estratégico donde una IA aprende de tus patrones de juego y evoluciona para desafiarte de maneras únicas.

## 🚀 Características Principales

### 🎮 Motor de Juego Avanzado
- **IA Multi-Personalidad**: 5 tipos diferentes de IA (Camaleón, Psicólogo, Vengativo, Empático, Evolucionado)
- **Fases de Evolución**: Aprendizaje → Espejo → Evolución
- **Celdas Especiales**: 18 tipos diferentes con efectos únicos
- **Sistema de Combos**: Detección automática de patrones y multiplicadores

### 🧠 Análisis Inteligente
- **Heatmaps de Decisiones**: Visualización en tiempo real de patrones de juego
- **Predictor de Movimientos**: IA predice tus próximos movimientos
- **Análisis Emocional**: Detección del estado emocional del jugador
- **Temas Dinámicos**: 6 temas que cambian según tu estado emocional

### 🏆 Sistema de Progresión
- **Sistema de Logros**: 25+ logros con diferentes raridades
- **Niveles y XP**: Progresión basada en rendimiento
- **Títulos Desbloqueables**: Títulos especiales por logros específicos
- **Estadísticas Detalladas**: Tracking completo de rendimiento

### 🌐 Funcionalidades Sociales
- **Rankings Globales**: Compite con jugadores de todo el mundo
- **Sistema de Amigos**: Conecta y desafía a otros jugadores
- **Eventos Temporales**: Eventos especiales con recompensas únicas
- **Torneos**: Competencias organizadas con premios

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Zustand** para manejo de estado
- **React Router 6** para navegación

### Backend & Autenticación
- **Firebase Authentication** (Email + Google)
- **Firestore** para base de datos
- **Firebase Analytics** para métricas

### Herramientas de Desarrollo
- **Vite** como bundler
- **Vitest** para testing
- **ESLint + Prettier** para calidad de código

## 📦 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd mind-mirror
npm install
```

### 2. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password y Google)
3. Crear una base de datos Firestore
4. Copiar las credenciales de configuración

### 3. Variables de Entorno

Copiar `.env.example` a `.env` y completar con tus credenciales de Firebase:

```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

### 4. Configurar Firestore

Crear las siguientes colecciones en Firestore:

#### Colección `users`
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  level: number,
  xp: number,
  totalGames: number,
  gamesWon: number,
  createdAt: timestamp,
  lastLogin: timestamp,
  preferences: {
    theme: string,
    difficulty: string,
    soundEnabled: boolean,
    visualEffects: boolean
  },
  stats: {
    totalScore: number,
    averageReactionTime: number,
    bestReactionTime: number,
    combosAchieved: number,
    specialCellsActivated: number,
    aiPhaseReached: string,
    preferredQuadrants: array,
    playtime: number,
    winStreak: number,
    bestWinStreak: number
  },
  achievements: array,
  unlockedPersonalities: array,
  customAIs: array
}
```

#### Colección `gameSessions`
```javascript
{
  userId: string,
  gameData: object,
  timestamp: timestamp,
  duration: number,
  aiPersonality: string,
  difficulty: number,
  achievements: array,
  patterns: array
}
```

#### Colección `customAIs`
```javascript
{
  userId: string,
  name: string,
  description: string,
  personality: object,
  behaviors: object,
  specialAbilities: array,
  isPublic: boolean,
  createdAt: timestamp,
  downloads: number,
  rating: number
}
```

### 5. Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Game sessions - users can read/write their own
    match /gameSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.uid == request.resource.data.userId);
    }
    
    // Custom AIs - users can read/write their own, read public ones
    match /customAIs/{aiId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || resource.data.isPublic == true);
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Public leaderboard - read only
    match /leaderboard/{entry} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🚀 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Tests
npm run test

# Linting
npm run lint

# Formateo de código
npm run format
```

### Estructura del Proyecto

```
src/
├── components/           # Componentes React reutilizables
│   ├── auth/            # Componentes de autenticación
│   ├── game/            # Componentes específicos del juego
│   ├── layout/          # Componentes de layout
│   └── ui/              # Componentes de UI base
├── config/              # Configuraciones (Firebase, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Lógica de negocio y utilidades
│   ├── achievementSystem.ts
│   ├── gameEngine.ts
│   ├── hexagonalGeometry.ts
│   ├── heatmapSystem.ts
│   ├── dynamicThemes.ts
│   ├── particleStories.ts
│   ├── infiniteMode.ts
│   └── specialCells.ts
├── pages/               # Páginas de la aplicación
├── services/            # Servicios (Firebase, APIs)
├── store/               # Estado global (Zustand)
└── types/               # Definiciones de tipos TypeScript
```

## 🌐 Despliegue en Netlify

### 1. Preparar para Despliegue

```bash
npm run build
```

### 2. Configurar Netlify

Crear `netlify.toml` en la raíz del proyecto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 3. Variables de Entorno en Netlify

En el panel de Netlify, agregar las variables de entorno:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### 4. Desplegar

1. Conectar repositorio a Netlify
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Agregar variables de entorno
4. Deploy!

## 🎯 Funcionalidades Implementadas

### ✅ Core del Juego
- [x] Tablero 8x8 interactivo
- [x] Sistema de turnos jugador vs IA
- [x] 18 tipos de celdas especiales
- [x] Sistema de combos y multiplicadores
- [x] 5 personalidades de IA diferentes
- [x] 3 fases de evolución de IA

### ✅ Análisis y Visualización
- [x] Heatmaps de decisiones
- [x] Predictor de movimientos
- [x] Análisis de patrones de juego
- [x] Temas dinámicos adaptativos
- [x] Sistema de partículas narrativas

### ✅ Progresión y Social
- [x] Sistema de logros (25+ logros)
- [x] Niveles y experiencia
- [x] Rankings globales
- [x] Perfil de usuario completo
- [x] Estadísticas detalladas

### ✅ Autenticación y Persistencia
- [x] Login con email y Google
- [x] Guardado automático de progresos
- [x] Sincronización en la nube
- [x] Perfil de usuario personalizable

### 🔄 En Desarrollo
- [ ] Modo hexagonal completo
- [ ] Modo infinito
- [ ] Multijugador en tiempo real
- [ ] Torneos automatizados
- [ ] IA personalizada por usuario

## 🎮 Cómo Jugar

1. **Registro**: Crea una cuenta o inicia sesión con Google
2. **Tutorial**: Completa el tutorial interactivo
3. **Juego**: Haz clic en celdas vacías para colocar tus fichas
4. **Estrategia**: Observa cómo la IA aprende de tus movimientos
5. **Evolución**: Adapta tu estrategia mientras la IA evoluciona
6. **Logros**: Desbloquea logros y sube de nivel

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema
4. Incluye logs de consola y pasos para reproducir

## 🎯 Roadmap

### Versión 1.1
- [ ] Modo hexagonal completo
- [ ] Sistema de clanes
- [ ] Chat en tiempo real

### Versión 1.2
- [ ] Modo infinito
- [ ] IA personalizada
- [ ] Replay de partidas

### Versión 2.0
- [ ] Multijugador
- [ ] Torneos automatizados
- [ ] Modo VR/AR

---

**Desarrollado con ❤️ para la comunidad gaming**