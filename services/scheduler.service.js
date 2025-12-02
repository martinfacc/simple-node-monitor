import db from '../database/sqlite.js'
import { getSystemMetrics } from './metrics.service.js'

export function startScheduler() {
  console.log('Guardado automático activo (cada 5s)')

  setInterval(async () => {
    const m = await getSystemMetrics()

    db.run(
      `INSERT INTO metrics
      (timestamp, cpu, mem_used, mem_total, disk_used, disk_total, disk_use_percent,
       disk_read_bytes, disk_write_bytes, disk_io_wait, net_rx, net_tx)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.timestamp,
        m.cpu,
        m.mem_used,
        m.mem_total,
        m.disk_used,
        m.disk_total,
        m.disk_use_percent,
        m.disk_read_bytes,
        m.disk_write_bytes,
        m.disk_io_wait,
        m.net_rx,
        m.net_tx
      ]
    )
  }, 5000)
}
