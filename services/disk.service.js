import si from 'systeminformation';

export async function getDiskMetrics() {
  // Información de particiones
  const partitions = await si.fsSize(); 

  // Estadísticas globales de disco
  const stats = await si.fsStats();

  // Otras métricas opcionales
  const blockDevices = await si.blockDevices(); // detalles físicos
  const ioWait = (await si.currentLoad()).currentLoadIowait; // % CPU esperando disco

  return {
    partitions: partitions.map(d => ({
      fs: d.fs,
      type: d.type,
      mount: d.mount,
      size_bytes: d.size,
      used_bytes: d.used,
      free_bytes: d.size - d.used,
      use_percent: d.use.toFixed(1)
    })),
    io: {
      read_bytes_total: stats.rx,
      write_bytes_total: stats.wx,
      transfer_bytes_total: stats.tx,
      read_bytes_per_sec: stats.rx_sec,
      write_bytes_per_sec: stats.wx_sec,
      transfer_bytes_per_sec: stats.tx_sec,
      t_io_total: stats.t_io,
      t_io_per_sec: stats.t_io_sec
    },
    blockDevices: blockDevices.map(b => ({
      name: b.name,
      type: b.type,
      size_bytes: b.size,
      vendor: b.vendor,
      model: b.model,
      mount: b.mount
    })),
    io_wait_percent: ioWait.toFixed(2)
  };
}

// Ejemplo de uso
// getDiskMetrics().then(console.log);
