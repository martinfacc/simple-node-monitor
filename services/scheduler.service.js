import { Op } from 'sequelize'
import { Metric } from '../database/sequelize.js'
import {
  METRICS_RETENTION_DAYS,
  METRICS_SAVE_INTERVAL_MS,
  METRICS_CLEANUP_INTERVAL_MS
} from '../env.js'
import { getSystemMetrics } from './metrics.service.js'

export function startScheduler() {
  console.log(
    `Guardado automático activo (cada ${METRICS_SAVE_INTERVAL_MS / 1000}s)`
  )

  const intervalId = setInterval(async () => {
    try {
      const m = await getSystemMetrics()

      await Metric.create({
        timestamp: m.timestamp,
        cpu: m.cpu,
        mem_used: m.mem_used,
        mem_total: m.mem_total,
        disk_used: m.disk_used,
        disk_total: m.disk_total,
        disk_use_percent: m.disk_use_percent,
        disk_read_bytes: m.disk_read_bytes,
        disk_write_bytes: m.disk_write_bytes,
        disk_io_wait: m.disk_io_wait,
        net_rx: m.net_rx,
        net_tx: m.net_tx
      })
    } catch (err) {
      console.error('Error guardando métricas en el scheduler:', err)
    }
  }, METRICS_SAVE_INTERVAL_MS)

  return () => {
    clearInterval(intervalId)
    console.log('Guardado automático detenido')
  }
}

export function startCleanupScheduler() {
  console.log(
    `Limpieza automática activa (retención ${METRICS_RETENTION_DAYS} días, cada ${
      METRICS_CLEANUP_INTERVAL_MS / 1000 / 60
    } min)`
  )

  const intervalId = setInterval(async () => {
    try {
      const now = Date.now()
      const cutoff = new Date(
        now - METRICS_RETENTION_DAYS * 24 * 60 * 60 * 1000
      ).toISOString()

      const deleted = await Metric.destroy({
        where: {
          timestamp: { [Op.lt]: cutoff }
        }
      })

      if (deleted > 0) {
        console.log(`Limpieza de métricas: eliminadas ${deleted} filas antiguas`)
      }
    } catch (err) {
      console.error('Error durante la limpieza de métricas antiguas:', err)
    }
  }, METRICS_CLEANUP_INTERVAL_MS)

  return () => {
    clearInterval(intervalId)
    console.log('Limpieza automática detenida')
  }
}
