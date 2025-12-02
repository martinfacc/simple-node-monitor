import { Router } from 'express'
import { getSystemMetrics } from '../services/metrics.service.js'

const router = Router()

router.get('/', async (req, res) => {
  const metrics = await getSystemMetrics()
  res.json(metrics)
})

export default router
