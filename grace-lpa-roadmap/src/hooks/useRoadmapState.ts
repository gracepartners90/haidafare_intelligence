import { useCallback, useEffect, useRef, useState } from 'react'
import { initialState, loadState, sanitize, saveState, type ProjectState, type RoadmapState } from '../lib/storage'

export function useRoadmapState() {
  const loaded = useRef(loadState())
  const [state, setState] = useState<RoadmapState>(loaded.current.state)
  const [storageOk, setStorageOk] = useState(loaded.current.available)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const ok = saveState(state)
    setStorageOk(ok)
    if (ok) setSavedAt(new Date())
  }, [state])

  const update = useCallback((id: string, patch: Partial<ProjectState>) => {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch, updatedAt: new Date().toISOString() } }))
  }, [])

  const replaceAll = useCallback((raw: unknown) => {
    // Accetta sia il file esportato completo sia lo stato grezzo.
    const src = raw && typeof raw === 'object' && 'stato' in raw ? (raw as { stato: unknown }).stato : raw
    setState(sanitize(src))
  }, [])

  const reset = useCallback(() => setState(initialState()), [])

  return { state, update, replaceAll, reset, storageOk, savedAt }
}
