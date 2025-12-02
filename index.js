import express from 'express'
import morgan from 'morgan'
import metricsRouter from './routes/metrics.route.js'
import historyRouter from './routes/history.route.js'
import { sequelize } from './database/sequelize.js'
import { startScheduler, startCleanupScheduler } from './services/scheduler.service.js'
import { APP_PORT } from './env.js'

const app = express()

app.use(morgan('dev'))
app.use(express.static('public'))

// Rutas API
app.use('/api/metrics', metricsRouter)
app.use('/api/history', historyRouter)

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('ERROR:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// Inicializar Sequelize y luego arrancar servidor y scheduler
await sequelize.authenticate()
await sequelize.sync()

const server = app.listen(APP_PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${APP_PORT}`)
})

// Inicia guardado automático cada 5s y limpieza periódica, y obtiene funciones para detenerlos
const stopScheduler = startScheduler()
const stopCleanupScheduler = startCleanupScheduler()

async function gracefulShutdown(signal) {
  console.log(`\nRecibida señal ${signal}. Cerrando servidor...`)

  stopScheduler()
  stopCleanupScheduler()

  server.close(async (err) => {
    if (err) {
      console.error('Error cerrando el servidor HTTP:', err)
    }

    try {
      await sequelize.close()
    } catch (dbErr) {
      console.error('Error cerrando la conexión Sequelize:', dbErr)
    }

    process.exit(0)
  })
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
