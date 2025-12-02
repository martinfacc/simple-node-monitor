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

    const rows = await Metric.findAll({
      where,
      order: [['id', 'DESC']],
      limit: 500,
      raw: true
    })

    res.json(rows.reverse())
  } catch (err) {
    console.error('Error obteniendo historial de métricas:', err)
    res.status(500).json({ error: 'No se pudo obtener el historial de métricas' })
  }
})

export default router
