import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

// Singleton event untuk sync antar komponen
const listeners = new Set()
function notifyAll(count) { listeners.forEach(fn => fn(count)) }

export function useNotif() {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    try {
      const r = await api.get('/stats/notif')
      const n = r.data.count || 0
      setCount(n)
      notifyAll(n)
    } catch {}
  }, [])

  useEffect(() => {
    // Register listener untuk update dari komponen lain
    const listener = (n) => setCount(n)
    listeners.add(listener)

    fetchCount()
    const interval = setInterval(fetchCount, 15000) // polling 15 detik

    return () => {
      listeners.delete(listener)
      clearInterval(interval)
    }
  }, [fetchCount])

  return { count, refresh: fetchCount }
}