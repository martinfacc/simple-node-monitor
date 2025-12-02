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

    const rows = await Metric.findAll(findOptions)

    const ascRows = rows.reverse()

    const withRates = ascRows.map((row, index) => {
      if (index === 0) {
        return {
          ...row,
          disk_read_kb_s: 0,
          disk_write_kb_s: 0
        }
      }

      const prev = ascRows[index - 1]
      const nowTs = new Date(row.timestamp).getTime()
      const prevTs = new Date(prev.timestamp).getTime()
      const deltaSeconds = (nowTs - prevTs) / 1000

      const safeDeltaSeconds = !Number.isFinite(deltaSeconds) || deltaSeconds <= 0 ? 1 : deltaSeconds

      const deltaReadBytes = (row.disk_read_bytes || 0) - (prev.disk_read_bytes || 0)
      const deltaWriteBytes = (row.disk_write_bytes || 0) - (prev.disk_write_bytes || 0)

      const readBytesPerSec = deltaReadBytes / safeDeltaSeconds
      const writeBytesPerSec = deltaWriteBytes / safeDeltaSeconds

      const disk_read_kb_s = Math.max(0, readBytesPerSec / 1024)
      const disk_write_kb_s = Math.max(0, writeBytesPerSec / 1024)

      return {
        ...row,
        disk_read_kb_s,
        disk_write_kb_s
      }
    })

    // Downsampling: si hay demasiados puntos, reducimos la cantidad
    const MAX_POINTS = 500
    let finalRows

    if (withRates.length > MAX_POINTS) {
      const step = Math.ceil(withRates.length / MAX_POINTS)
      finalRows = withRates.filter((row, index) => {
        // Siempre conservar el último punto además de los índices de paso
        return index % step === 0 || index === withRates.length - 1
      })
    } else {
      finalRows = withRates
    }

    res.json(finalRows)
  } catch (err) {
    console.error('Error obteniendo historial de métricas:', err)
    res.status(500).json({ error: 'No se pudo obtener el historial de métricas' })
  }
})

export default router
