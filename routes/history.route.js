import { Router } from 'express'
import { Op } from 'sequelize'
import { Metric } from '../database/sequelize.js'

const router = Router()

// Devuelve historial de métricas, opcionalmente filtrado por los últimos N minutos
router.get('/', async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes, 10)
    const hasValidMinutes = Number.isFinite(minutes) && minutes > 0

    const where = {}

    if (hasValidMinutes) {
      // Filtrar por timestamp ISO dentro de los últimos N minutos
      const now = Date.now()
      const from = new Date(now - minutes * 60 * 1000).toISOString()
      where.timestamp = { [Op.gte]: from }
    }

    const findOptions = {
      where,
      order: [['id', 'DESC']],
      raw: true
    }

    // Si se especifica un periodo en minutos, limitamos a 500 muestras.
    // Si no, devolvemos todo el historial disponible.
    if (hasValidMinutes) {
      findOptions.limit = 500
    }

    const rows = await Metric.findAll(findOptions)

    res.json(rows.reverse())
  } catch (err) {
    console.error('Error obteniendo historial de métricas:', err)
    res.status(500).json({ error: 'No se pudo obtener el historial de métricas' })
  }
})

export default router
