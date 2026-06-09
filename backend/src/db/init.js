/**
 * SI EKSIS - Database Initializer
 * Jalankan: npm run db:init
 */
require('dotenv').config()
const { createClient } = require('@libsql/client')
const bcrypt = require('bcryptjs')
const path   = require('path')
const fs     = require('fs')

const dbPath = path.resolve(process.env.DB_PATH || './src/db/si_eksis.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = createClient({
  url: process.env.LIBSQL_URL || `file:${dbPath}`,
  authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
})

async function main() {
  console.log('🚀 SI EKSIS - Inisialisasi Database...')

  // Aktifkan foreign keys
  await db.execute('PRAGMA foreign_keys = ON')
  // await db.execute('PRAGMA journal_mode = WAL')

  // Buat tabel
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS bidang (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      kode       TEXT NOT NULL UNIQUE,
      nama       TEXT NOT NULL,
      singkatan  TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT NOT NULL UNIQUE,
      password     TEXT NOT NULL,
      nama_lengkap TEXT NOT NULL,
      role         TEXT NOT NULL CHECK(role IN ('admin','bidang')),
      bidang_id    INTEGER REFERENCES bidang(id) ON DELETE SET NULL,
      is_active    INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS pegawai (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nama       TEXT NOT NULL,
      nip        TEXT,
      jabatan    TEXT,
      bidang_id  INTEGER NOT NULL REFERENCES bidang(id) ON DELETE CASCADE,
      is_active  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS surat (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_surat   TEXT NOT NULL,
      tanggal_surat TEXT NOT NULL,
      perihal       TEXT NOT NULL,
      asal_surat    TEXT NOT NULL,
      bidang_id     INTEGER NOT NULL REFERENCES bidang(id),
      file_pdf      TEXT,
      status        TEXT NOT NULL DEFAULT 'belum_dibaca' CHECK(status IN ('belum_dibaca','sudah_dibaca','terlambat')),
      catatan       TEXT,
      created_by    INTEGER NOT NULL REFERENCES users(id),
      created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS log_baca (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      surat_id   INTEGER NOT NULL REFERENCES surat(id) ON DELETE CASCADE,
      pegawai_id INTEGER NOT NULL REFERENCES pegawai(id),
      dibuka_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_surat_bidang  ON surat(bidang_id);
    CREATE INDEX IF NOT EXISTS idx_surat_status  ON surat(status);
    CREATE INDEX IF NOT EXISTS idx_surat_created ON surat(created_at);
    CREATE INDEX IF NOT EXISTS idx_log_surat     ON log_baca(surat_id);
    CREATE INDEX IF NOT EXISTS idx_pegawai_bidang ON pegawai(bidang_id);
  `)
  console.log('✅ Tabel berhasil dibuat')

  // Seed bidang
  const bidangData = [
    ['REHSOS',       'Bidang Rehabilitasi Sosial',             'Rehsos'],
    ['PFM',          'Bidang Penanganan Fakir Miskin',         'PFM'],
    ['LINJAMSOS',    'Bidang Perlindungan dan Jaminan Sosial', 'Linjamsos'],
    ['PEMBERDAYAAN', 'Bidang Pemberdayaan Sosial',             'Pemberdayaan'],
  ]
  for (const [kode, nama, singkatan] of bidangData) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO bidang (kode, nama, singkatan) VALUES (?, ?, ?)',
      args: [kode, nama, singkatan],
    })
  }
  console.log('✅ Data bidang di-seed')

  // Ambil ID bidang
  const getBidangId = async (kode) => {
    const r = await db.execute({ sql: 'SELECT id FROM bidang WHERE kode = ?', args: [kode] })
    return r.rows[0]?.id
  }

  // Seed users
  const SALT = 12
  const users = [
    { username: 'admin',        password: 'admin123',  nama: 'Administrator Sekretariat',                  role: 'admin',  kode: null },
    { username: 'rehsos',       password: 'bidang123', nama: 'Admin Bidang Rehabilitasi Sosial',           role: 'bidang', kode: 'REHSOS' },
    { username: 'pfm',          password: 'bidang123', nama: 'Admin Bidang Penanganan Fakir Miskin',       role: 'bidang', kode: 'PFM' },
    { username: 'linjamsos',    password: 'bidang123', nama: 'Admin Bidang Perlindungan dan Jaminan Sosial', role: 'bidang', kode: 'LINJAMSOS' },
    { username: 'pemberdayaan', password: 'bidang123', nama: 'Admin Bidang Pemberdayaan Sosial',           role: 'bidang', kode: 'PEMBERDAYAAN' },
  ]
  for (const u of users) {
    const hash      = bcrypt.hashSync(u.password, SALT)
    const bidang_id = u.kode ? await getBidangId(u.kode) : null
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (username, password, nama_lengkap, role, bidang_id) VALUES (?, ?, ?, ?, ?)',
      args: [u.username, hash, u.nama, u.role, bidang_id],
    })
  }
  console.log('✅ Data user di-seed')

  // Seed pegawai
  const pegawaiData = [
    { nama: 'Dra. Hj. Siti Nurhaliza',    nip: '197203151998032001', jabatan: 'Kepala Bidang Rehabilitasi Sosial',      kode: 'REHSOS' },
    { nama: 'Ahmad Fauzi, S.Sos',          nip: '198501102010011012', jabatan: 'Analis Kebijakan Ahli Muda',             kode: 'REHSOS' },
    { nama: 'Dewi Rahayu, S.Sos',          nip: '199002202015032003', jabatan: 'Penyuluh Sosial Ahli Pertama',           kode: 'REHSOS' },
    { nama: 'Ir. Budi Santoso, M.Si',      nip: '196811201993031005', jabatan: 'Kepala Bidang Penanganan Fakir Miskin',  kode: 'PFM' },
    { nama: 'Ratna Sari, S.E',             nip: '199204152016042001', jabatan: 'Pengolah Data Kemiskinan',               kode: 'PFM' },
    { nama: 'Eko Prasetyo, S.Sos',         nip: '198809102013011008', jabatan: 'Analis Sosial',                          kode: 'PFM' },
    { nama: 'Hj. Yanti Kusumawati, S.H',   nip: '197506181999032002', jabatan: 'Kepala Bidang Linjamsos',               kode: 'LINJAMSOS' },
    { nama: 'Rudi Hermawan, S.Sos',        nip: '199001052014011003', jabatan: 'Analis Perlindungan Sosial',             kode: 'LINJAMSOS' },
    { nama: 'Nurul Hidayah, A.Md',         nip: '199307202017042002', jabatan: 'Pengadministrasi Umum',                  kode: 'LINJAMSOS' },
    { nama: 'Drs. Agus Suryanto, M.Si',    nip: '196912101995031007', jabatan: 'Kepala Bidang Pemberdayaan Sosial',      kode: 'PEMBERDAYAAN' },
    { nama: 'Siti Rahayu, S.Sos',          nip: '198802142012042005', jabatan: 'Penyuluh Sosial Ahli Muda',             kode: 'PEMBERDAYAAN' },
    { nama: 'Firman Wijaya, S.E',          nip: '199106302016011004', jabatan: 'Pengelola Program Pemberdayaan',         kode: 'PEMBERDAYAAN' },
  ]
  for (const p of pegawaiData) {
    const bidang_id = await getBidangId(p.kode)
    await db.execute({
      sql: 'INSERT OR IGNORE INTO pegawai (nama, nip, jabatan, bidang_id) VALUES (?, ?, ?, ?)',
      args: [p.nama, p.nip, p.jabatan, bidang_id],
    })
  }
  console.log('✅ Data pegawai di-seed')

  console.log(`
📊 Database SI EKSIS siap!
🔑 Akun default:
   admin        / admin123   → Sekretariat
   rehsos       / bidang123  → Bidang Rehsos
   pfm          / bidang123  → Bidang PFM
   linjamsos    / bidang123  → Bidang Linjamsos
   pemberdayaan / bidang123  → Bidang Pemberdayaan
  `)
}

main().catch(console.error).finally(() => process.exit())
