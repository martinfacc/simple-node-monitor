import sqlite3 from 'sqlite3'
sqlite3.verbose()

const db = new sqlite3.Database('./db.sqlite')

db.serialize(() => {
  db.run(`
    CREATE TABLE metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        cpu REAL,
        mem_used INTEGER,
        mem_total INTEGER,
        disk_used INTEGER,
        disk_total INTEGER,
        disk_use_percent REAL,
        disk_read_bytes REAL,
        disk_write_bytes REAL,
        disk_io_wait REAL,
        net_rx REAL,
        net_tx REAL
    );
  `)
})

export default db
