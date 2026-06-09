-- ============================================
-- SI EKSIS - Sistem Informasi Ekspedisi Surat Internal
-- Dinas Sosial Kabupaten Cirebon
-- Schema Database v1.0
-- ============================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================
-- TABEL: users
-- Menyimpan akun login (admin sekretariat + 4 bidang)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  nama_lengkap TEXT   NOT NULL,
  role        TEXT    NOT NULL CHECK(role IN ('admin', 'bidang')),
  bidang_id   INTEGER REFERENCES bidang(id) ON DELETE SET NULL,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- TABEL: bidang
-- 4 bidang di Dinas Sosial Kab. Cirebon
-- ============================================
CREATE TABLE IF NOT EXISTS bidang (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kode        TEXT    NOT NULL UNIQUE,
  nama        TEXT    NOT NULL,
  singkatan   TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- TABEL: pegawai
-- Daftar pegawai per bidang (untuk pilihan "siapa yang buka surat")
-- ============================================
CREATE TABLE IF NOT EXISTS pegawai (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nama        TEXT    NOT NULL,
  nip         TEXT,
  jabatan     TEXT,
  bidang_id   INTEGER NOT NULL REFERENCES bidang(id) ON DELETE CASCADE,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- TABEL: surat
-- Data surat masuk + disposisi
-- ============================================
CREATE TABLE IF NOT EXISTS surat (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_surat   TEXT    NOT NULL,
  tanggal_surat TEXT    NOT NULL,
  perihal       TEXT    NOT NULL,
  asal_surat    TEXT    NOT NULL,
  bidang_id     INTEGER NOT NULL REFERENCES bidang(id),
  file_pdf      TEXT,
  status        TEXT    NOT NULL DEFAULT 'belum_dibaca'
                CHECK(status IN ('belum_dibaca', 'sudah_dibaca', 'terlambat')),
  catatan       TEXT,
  created_by    INTEGER NOT NULL REFERENCES users(id),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- TABEL: log_baca
-- Rekam jejak siapa + kapan surat dibuka
-- ============================================
CREATE TABLE IF NOT EXISTS log_baca (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  surat_id    INTEGER NOT NULL REFERENCES surat(id) ON DELETE CASCADE,
  pegawai_id  INTEGER NOT NULL REFERENCES pegawai(id),
  dibuka_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- INDEXES untuk performa query
-- ============================================
CREATE INDEX IF NOT EXISTS idx_surat_bidang    ON surat(bidang_id);
CREATE INDEX IF NOT EXISTS idx_surat_status    ON surat(status);
CREATE INDEX IF NOT EXISTS idx_surat_created   ON surat(created_at);
CREATE INDEX IF NOT EXISTS idx_log_surat       ON log_baca(surat_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_bidang  ON pegawai(bidang_id);
