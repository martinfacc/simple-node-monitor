import { Router } from 'express'
import { getSystemMetrics } from '../services/metrics.service.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const metrics = await getSystemMetrics()
    res.json(metrics)
  } catch (err) {
    console.error('Error obteniendo métricas actuales:', err)
    res.status(500).json({ error: 'No se pudieron obtener las métricas actuales' })
  }
})

export default router
