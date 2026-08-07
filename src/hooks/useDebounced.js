import { useEffect, useState } from 'react'

/** Keeps a search box from refiltering a long list on every keystroke. */
export function useDebounced(value, ms = 200) {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return settled
}
