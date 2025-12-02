import si from 'systeminformation'

export async function getSystemMetrics() {
  const [cpuRaw, memRaw, disksRaw, statsRaw, netRaw] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.fsStats().catch(() => null), // <--- manejar error
    si.networkStats().catch(() => [])
  ])

  const cpu = cpuRaw || {}
  const mem = memRaw || {}
  const disks = Array.isArray(disksRaw) ? disksRaw : []
  const stats = statsRaw || null
  const net = Array.isArray(netRaw) ? netRaw : []

  const disk_used = disks?.[0]?.used || 0
  const disk_total = disks?.[0]?.size || 0
  const disk_use_percent = disks?.[0]?.use || 0

  return {
    timestamp: new Date().toISOString(),
    cpu: cpu.currentLoad || 0,
    mem_used: (mem.total && mem.available)
      ? mem.total - mem.available
      : mem.used || 0,
    mem_total: mem.total || 0,
    disk_used,
    disk_total,
    disk_use_percent,
    disk_read_bytes: stats?.rx || 0,
    disk_write_bytes: stats?.wx || 0,
    disk_io_wait: cpu.currentLoadIowait || 0,
    net_rx: net.reduce((a, b) => a + (b.rx || 0), 0),
    net_tx: net.reduce((a, b) => a + (b.tx || 0), 0)
  }
}
