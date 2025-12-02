import express from 'express'
import morgan from 'morgan'
import metricsRouter from './routes/metrics.route.js'
import historyRouter from './routes/history.route.js'
import { startScheduler } from './services/scheduler.service.js'
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

app.listen(APP_PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${APP_PORT}`)
})

// Inicia guardado automático cada 5s
startScheduler()
