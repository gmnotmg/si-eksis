import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatTanggal(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return isValid(d) ? format(d, 'dd MMM yyyy', { locale: id }) : '-'
  } catch { return '-' }
}

export function formatTanggalWaktu(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm', { locale: id }) : '-'
  } catch { return '-' }
}

export function formatRelative(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true, locale: id }) : '-'
  } catch { return '-' }
}

export function getStatusBadge(status) {
  const map = {
    sudah_dibaca: { label: 'Sudah Dibaca', cls: 'badge-read' },
    belum_dibaca: { label: 'Belum Dibaca', cls: 'badge-unread' },
    terlambat:    { label: 'Terlambat',    cls: 'badge-late' },
  }
  return map[status] || { label: status, cls: 'badge-unread' }
}

export function getErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Terjadi kesalahan.'
}
