import dotenv from 'dotenv'
dotenv.config()

const parsedPort = parseInt(process.env.APP_PORT, 10)

export const APP_PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000

const parsedRetentionDays = parseInt(process.env.METRICS_RETENTION_DAYS, 10)

export const METRICS_RETENTION_DAYS =
  Number.isFinite(parsedRetentionDays) && parsedRetentionDays > 0 ? parsedRetentionDays : 7

const parsedSaveIntervalMs = parseInt(process.env.METRICS_SAVE_INTERVAL_MS, 10)
const parsedCleanupIntervalMs = parseInt(process.env.METRICS_CLEANUP_INTERVAL_MS, 10)

export const METRICS_SAVE_INTERVAL_MS =
  Number.isFinite(parsedSaveIntervalMs) && parsedSaveIntervalMs > 0
    ? parsedSaveIntervalMs
    : 5000

export const METRICS_CLEANUP_INTERVAL_MS =
  Number.isFinite(parsedCleanupIntervalMs) && parsedCleanupIntervalMs > 0
    ? parsedCleanupIntervalMs
    : 60 * 60 * 1000
