# 🚀 Guía de Despliegue - Mind Mirror

Esta guía te ayudará a desplegar Mind Mirror en producción usando la arquitectura full-stack recomendada.

## 📋 Arquitectura de Despliegue

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│    Backend      │────│   Base de       │
│   (Netlify)     │    │ (Netlify Func.) │    │   Datos         │
│                 │    │                 │    │  (Supabase)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Componentes:

- **Frontend**: React SPA desplegado en Netlify
- **Backend**: API REST como Netlify Functions
- **Base de Datos**: PostgreSQL en Supabase
- **Autenticación**: Firebase Auth (opcional)

## 🗄️ 1. Configurar Base de Datos (Supabase)

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y las API keys

### Paso 2: Configurar la Base de Datos

1. En el dashboard de Supabase, ve a SQL Editor
2. Ejecuta el script `db/schema.sql` completo
3. Ejecuta el script `db/seeds.sql` para datos de prueba (opcional)

### Paso 3: Configurar Variables de Entorno

```bash
# En tu archivo .env
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 2. Desplegar en Netlify

### Método 1: Deploy Automático desde Git

1. **Conectar Repositorio**:

   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repositorio de GitHub
   - Selecciona la rama `main` para producción

2. **Configurar Build Settings**:

   ```
   Build command: npm run build
   Publish directory: dist/spa
   ```

3. **Configurar Variables de Entorno**:
   Ve a Site settings > Environment variables y añade:
   ```
   NODE_ENV=production
   SUPABASE_DB_URL=tu_url_de_supabase
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_anon_key
   ```

### Método 2: Deploy Manual

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Hacer build del proyecto
npm run build

# 3. Deploy inicial
netlify deploy --prod --dir=dist/spa

# 4. Configurar variables de entorno
netlify env:set SUPABASE_DB_URL "tu_url"
netlify env:set NODE_ENV "production"
```

## 🔧 3. Configuración Avanzada

### Configurar Custom Domain (Opcional)

```bash
# Con Netlify CLI
netlify domains:add yourdomain.com
```

### Configurar SSL

SSL se configura automáticamente con Netlify. Para dominios custom:

1. Ve a Site settings > Domain management
2. Netlify generará automáticamente el certificado SSL

### Monitoreo y Analytics

```bash
# Habilitar analytics de Netlify
netlify analytics:enable
```

## 🧪 4. Configuración de Entornos

### Desarrollo Local

```bash
# 1. Copiar archivo de ejemplo
cp .env.example .env

# 2. Configurar variables locales
# Editar .env con tus valores

# 3. Instalar dependencias
npm install

# 4. Ejecutar en desarrollo
npm run dev
```

### Staging/Preview

Netlify automáticamente crea previews para pull requests. Para configurar staging:

```toml
# En netlify.toml
[context.branch-deploy]
  [context.branch-deploy.environment]
    NODE_ENV = "staging"
    SUPABASE_DB_URL = "tu_url_de_staging"
```

## 🔒 5. Seguridad en Producción

### Variables de Entorno Obligatorias

```bash
# Generar secretos seguros
openssl rand -hex 32  # Para JWT_SECRET

# Variables mínimas requeridas
NODE_ENV=production
SUPABASE_DB_URL=postgresql://...
JWT_SECRET=tu_secreto_seguro_aqui
```

### Configurar CORS

En `server/index.ts`, configurar CORS para producción:

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "https://yourdomain.com",
    credentials: true,
  }),
);
```

### Row Level Security (RLS) en Supabase

```sql
-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
CREATE POLICY "Users can only see own data" ON jugadores
  FOR ALL USING (auth.uid()::text = id);
```

## 📊 6. Monitoreo y Mantenimiento

### Logs de Netlify Functions

```bash
# Ver logs en tiempo real
netlify functions:log api

# Ver logs históricos en el dashboard
# Site settings > Functions > View logs
```

### Monitoreo de Base de Datos

- Dashboard de Supabase > Database > Logs
- Configurar alertas para uso de recursos

### Backup de Base de Datos

```bash
# Backup automático en Supabase (configurar en dashboard)
# O manual:
pg_dump $SUPABASE_DB_URL > backup_$(date +%Y%m%d).sql
```

## 🚨 7. Solución de Problemas

### Error: "Database connection failed"

1. Verificar que la URL de Supabase sea correcta
2. Verificar que las variables de entorno estén configuradas
3. Verificar que la base de datos esté activa

### Error: "Function timeout"

Las Netlify Functions tienen límite de 10s en plan gratuito:

```typescript
// Optimizar consultas lentas
app.use(timeout("9s"));
```

### Error: "CORS blocked"

```typescript
// Verificar configuración CORS
app.use(
  cors({
    origin: ["https://yourdomain.com", "https://yourdomain.netlify.app"],
  }),
);
```

## 📈 8. Optimizaciones de Rendimiento

### Edge Functions (Avanzado)

Para mejor rendimiento global:

```bash
# Mover funciones críticas a Edge
netlify edge-functions:create analytics
```

### Cache Strategy

```typescript
// En las respuestas de API
res.set("Cache-Control", "public, max-age=300"); // 5 minutos
```

### Optimización de Bundle

```bash
# Analizar bundle size
npm run build
npx vite-bundle-analyzer dist/spa
```

## 🔄 9. CI/CD Avanzado

### GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: netlify/actions/deploy@master
        with:
          publish-dir: "./dist/spa"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## 📞 10. Soporte

### Recursos Útiles

- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide)

### Logs de Debug

```bash
# Habilitar logs detallados
export DEBUG=true
export SQL_LOGS=true
export LOG_LEVEL=debug
```

---

## ✅ Checklist de Despliegue

- [ ] ✅ Configurar proyecto en Supabase
- [ ] ✅ Ejecutar scripts de base de datos
- [ ] ✅ Configurar variables de entorno
- [ ] ✅ Conectar repositorio a Netlify
- [ ] ✅ Configurar build settings
- [ ] ✅ Verificar funciones serverless
- [ ] ✅ Probar API endpoints
- [ ] ✅ Configurar dominio custom (opcional)
- [ ] ✅ Habilitar SSL
- [ ] ✅ Configurar monitoreo
- [ ] ✅ Implementar backups
- [ ] ✅ Documentar proceso

¡Tu aplicación Mind Mirror estará lista para producción! 🎮✨
