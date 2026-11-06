import { useEffect, useState } from 'react'
import { fetchSettings } from '../api/ops.js'

let cache = null
let pending = null

/** GET /api/settings once per page load — business details, GST rate, feature switches. */
export function useSettings() {
  const [settings, setSettings] = useState(cache)
  useEffect(() => {
    if (cache) return
    pending = pending || fetchSettings().catch(() => ({}))
    pending.then((s) => {
      cache = s || {}
      setSettings(cache)
    })
  }, [])
  return settings || {}
}
