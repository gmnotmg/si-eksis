/**
 * SI EKSIS - Database Connection
 * Menggunakan @libsql/client — pure JS, support SQLite lokal & Turso cloud
 * Migrasi ke cloud: tinggal ganti url + authToken di .env
 */

const { createClient } = require('@libsql/client')
const path = require('path')
require('dotenv').config()

let client = null

function getDb() {
  if (!client) {
    const dbPath = path.resolve(process.env.DB_PATH || './src/db/si_eksis.db')
    client = createClient({
      // Lokal: file:./path/to/db
      // Cloud (Turso): libsql://your-db.turso.io + LIBSQL_AUTH_TOKEN
      url: process.env.LIBSQL_URL || `file:${dbPath}`,
      authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
    })
  }
  return client
}

module.exports = getDb
