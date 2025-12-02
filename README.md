# simple-node-monitor

Monitor ligero de recursos del sistema escrito en Node.js.  
Recoge métricas de CPU, memoria, disco e I/O de red de forma periódica, las guarda en SQLite (vía Sequelize) y las muestra en un dashboard web con gráficos en tiempo real.

## Características

- **Backend en Node.js + Express**
  - API REST para métricas actuales y para el historial.
  - Logging HTTP con `morgan`.
  - Manejo de errores con middleware centralizado.

- **Recogida y almacenamiento de métricas**
  - Métricas obtenidas mediante [`systeminformation`](https://github.com/sebhildebrandt/systeminformation).
  - Guardado periódico en base de datos SQLite usando Sequelize.
  - Limpieza automática de datos antiguos para que el fichero no crezca sin límite.

- **Dashboard web**
  - Servido como estático desde `/public`.
  - Graficado con Chart.js (vía CDN).
  - Selector de periodo (10min, 30min, 1h, 3h, 6h, 12h, 1 día, 1 semana, todo).
  - Gráficos de porcentaje (CPU, RAM, Disco) siempre en rango 0–100.

- **Configuración por entorno**
  - Puerto de la app.
  - Días de retención de métricas.
  - Intervalo de guardado de métricas.
  - Intervalo de ejecución del proceso de limpieza.

---

## Requisitos

- Node.js  18 (compatible con ESM / `import`).
- Yarn o npm.
- Permisos suficientes para acceder a info del sistema en el host.

---

## Instalación

Clona el repositorio e instala dependencias:

```bash
git clone <URL_DEL_REPO>
cd simple-node-monitor

# con yarn
yarn

# o con npm
npm install
```

---

## Configuración

La app lee configuración desde variables de entorno mediante `dotenv`.

Ejemplo: `.env.example` (cpialo a `.env` y ajusta):

```bash
# Puerto de la aplicación (por defecto 3000)
APP_PORT=3000

# Retención de métricas en días (por defecto 7 días)
METRICS_RETENTION_DAYS=7

# Intervalo de guardado de métricas en milisegundos (por defecto 5000 = 5s)
METRICS_SAVE_INTERVAL_MS=5000

# Intervalo de ejecución de la limpieza de métricas en milisegundos (por defecto 3600000 = 1h)
METRICS_CLEANUP_INTERVAL_MS=3600000
```

### Detalle de variables

| Variable                     | Tipo    | Por defecto        | Descripción                                                                 |
|-----------------------------|---------|--------------------|-----------------------------------------------------------------------------|
| `APP_PORT`                  | número  | `3000`             | Puerto HTTP donde se expone la aplicación.                                 |
| `METRICS_RETENTION_DAYS`    | número  | `7`                | Días de retención de métricas antes de ser eliminadas.                     |
| `METRICS_SAVE_INTERVAL_MS`  | número  | `5000` (5 s)       | Intervalo entre capturas y guardado de nuevas métricas.                    |
| `METRICS_CLEANUP_INTERVAL_MS` | número | `3600000` (1 h)    | Intervalo entre ejecuciones del proceso de limpieza de métricas antiguas. |

---

## Puesta en marcha

Una vez configurado el `.env`:

```bash
# con yarn
yarn start

# o con npm
npm start
```

La app se inicializa así:

1. Carga configuración de entorno (`env.js`).
2. Inicializa Sequelize sobre `./db.sqlite` y sincroniza el modelo `Metric`.
3. Arranca el servidor Express en `APP_PORT`.
4. Inicia:
   - **Scheduler de guardado** de métricas (cada `METRICS_SAVE_INTERVAL_MS`).
   - **Scheduler de limpieza** de datos antiguos (cada `METRICS_CLEANUP_INTERVAL_MS`).

Al parar con `Ctrl+C`:
- Se detienen ambos schedulers.
- Se cierra el servidor HTTP.
- Se cierra la conexión de Sequelize.

---

## Uso

### Dashboard web

Abre en el navegador:

```text
http://localhost:<APP_PORT>
```

Verás:

- **Tarjetas** con valores actuales:
  - CPU (%)
  - RAM (%)
  - Disco (%)
  - I/O wait (%)
- **Gráficos de líneas**:
  - CPU (%)
  - Memoria (%)
  - Disco (%)
  - Disco I/O (KB/s)
  - Red (KB/s)
- **Selector de periodo** (arriba a la derecha):
  - Últimos 10 min, 30 min, 1h, 3h, 6h, 12h, 1 día, 1 semana, todo.

El frontend consulta periódicamente `/api/history` y actualiza tanto los valores actuales como las series de los gráficos.

### API

#### GET `/api/metrics`

Devuelve un snapshot actual de métricas del sistema.

Ejemplo de respuesta:

```json
{
  "timestamp": "2025-12-01T23:45:12.345Z",
  "cpu": 12.3,
  "mem_used": 1234567890,
  "mem_total": 17179869184,
  "disk_used": 9876543210,
  "disk_total": 21474836480,
  "disk_use_percent": 45.6,
  "disk_read_bytes": 123456,
  "disk_write_bytes": 789012,
  "disk_io_wait": 0.5,
  "net_rx": 12345,
  "net_tx": 67890
}
```

> Esta misma estructura es la que se guarda en DB en la tabla `metrics`.

#### GET `/api/history`

Devuelve histórico de métricas ordenadas cronológicamente (más antiguas primero), con un máximo de 500 muestras.  
Opcionalmente se puede filtrar por periodo en minutos:

```text
GET /api/history
GET /api/history?minutes=10
GET /api/history?minutes=60
GET /api/history?minutes=1440   # último día
```

Parámetros:

- `minutes` (opcional, entero > 0):  
  Devuelve solo las muestras cuyo `timestamp` sea dentro de los últimos `N` minutos respecto a “ahora”.

Respuesta: array de objetos con el mismo esquema que `/api/metrics`, más el campo `id`.

---

## Arquitectura interna

### Estructura de carpetas (simplificada)

```text
.
├── database
│   ├── db.sqlite             # fichero de base de datos SQLite
│   └── sequelize.js          # instancia Sequelize + modelo Metric
├── routes
│   ├── metrics.route.js      # /api/metrics
│   └── history.route.js      # /api/history
├── services
│   ├── metrics.service.js    # obtiene métricas del sistema (systeminformation)
│   └── scheduler.service.js  # schedulers de guardado y limpieza
├── public
│   └── index.html            # dashboard (HTML + CSS + JS + Chart.js)
├── env.js                    # carga y valida variables de entorno
├── index.js                  # entrypoint: Express + Sequelize + schedulers
├── package.json
└── .env.example
```

### Base de datos

- **Tecnología**: SQLite mediante Sequelize.
- **Modelo**: `Metric` (`database/sequelize.js`), mapeado a la tabla `metrics`:

Campos principales:

- `id` (PK, autoincremental)
- `timestamp` (TEXT ISO)
- `cpu` (REAL)
- `mem_used`, `mem_total` (INTEGER)
- `disk_used`, `disk_total` (INTEGER)
- `disk_use_percent` (REAL)
- `disk_read_bytes`, `disk_write_bytes` (REAL)
- `disk_io_wait` (REAL)
- `net_rx`, `net_tx` (REAL)

### Schedulers

En `services/scheduler.service.js`:

- `startScheduler()`  
  - Intervalo: `METRICS_SAVE_INTERVAL_MS` (ms).
  - Acción:
    - Llama a `getSystemMetrics()` (service).
    - Inserta una fila en `Metric` (Sequelize).
  - Devuelve función `stop()` para cancelar el intervalo.

- `startCleanupScheduler()`  
  - Intervalo: `METRICS_CLEANUP_INTERVAL_MS` (ms).
  - Acción:
    - Calcula `cutoff` = ahora - `METRICS_RETENTION_DAYS`.
    - Hace `Metric.destroy` donde `timestamp < cutoff`.
    - Muestra en log cuántas filas borró.
  - Devuelve función `stop()` para cancelar el intervalo.

---

## Desarrollo

### Scripts

En `package.json`:

```json
"scripts": {
  "start": "node index.js",
  "prettier": "prettier --write ."
}
```

- `yarn start` / `npm start`  
  Arranca el servidor.
- `yarn prettier` / `npm run prettier`  
  Formatea el código con Prettier.

> Puedes añadir un script `dev` con nodemon si quieres hot reload durante el desarrollo.

### Estilo de código

- ESM (`import` / `export`).
- Formateo con Prettier (config `.prettierrc` en la raíz).
- Manejo de errores con `try/catch` y logs descriptivos en los servicios y rutas.

---

## Notas y futuras mejoras

Posibles extensiones:

- Autenticación o API key para proteger `/api/*` en entornos expuestos.
- Endpoints de agregación (promedios por hora/día, máximos, etc.).
- Exportación de histórico a CSV/JSON.
- Configuración dinámica (cambiar intervalos y retención desde UI en lugar de `.env`).

---

## Licencia

Licencia ISC (ver `package.json`).
