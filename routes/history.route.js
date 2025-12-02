import { Router } from "express";
import db from "../database/sqlite.js";

const router = Router();

// Devuelve últimas 500 muestras (≈ 40 min)
router.get("/", (req, res) => {
  db.all(
  `SELECT id, timestamp, cpu, mem_used, mem_total, disk_used, disk_total, disk_use_percent,
          disk_read_bytes, disk_write_bytes, disk_io_wait, net_rx, net_tx
   FROM metrics ORDER BY id DESC LIMIT 500`,
  [],
  (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.reverse());
  }
);

});

export default router;
