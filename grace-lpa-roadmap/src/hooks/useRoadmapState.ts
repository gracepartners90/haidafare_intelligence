import { useCallback, useEffect, useRef, useState } from 'react'
import { connectDb, createWriter, fromDocs, subscribe } from '../lib/sharedStore'
import { initialState, loadState, sanitize, saveState, type ProjectState, type RoadmapState } from '../lib/storage'

/**
 * - `connecting`: in attesa di sapere se l'archivio condiviso è disponibile
 * - `shared`: dati sincronizzati per tutto il team (Artifact con `db`)
 * - `local`: dati salvati solo in questo browser
 * - `none`: nessuna persistenza disponibile
 */
export type StorageMode = 'connecting' | 'shared' | 'local' | 'none'

export function useRoadmapState() {
  const loaded = useRef(loadState())
  const [state, setState] = useState<RoadmapState>(loaded.current.state)
  const [mode, setMode] = useState<StorageMode>(() => ('claude' in window ? 'connecting' : loaded.current.available ? 'local' : 'none'))
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [writeError, setWriteError] = useState(false)
  const writer = useRef<ReturnType<typeof createWriter> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Archivio condiviso, se la pagina gira come Artifact.
  useEffect(() => {
    if (mode !== 'connecting') return
    let unsub: (() => void) | undefined
    let alive = true
    void connectDb().then((db) => {
      if (!alive) return
      if (!db) {
        setMode(loaded.current.available ? 'local' : 'none')
        return
      }
      writer.current = createWriter(db, () => setWriteError(true))
      setMode('shared')
      setState(initialState())
      unsub = subscribe(
        db,
        (raw) => {
          const remote = fromDocs(raw)
          const pending = writer.current?.pending
          setState((prev) => {
            if (!pending?.size) return remote
            const merged = { ...remote }
            for (const id of pending) merged[id] = prev[id]
            return merged
          })
        },
        () => setMode(loaded.current.available ? 'local' : 'none'),
      )
    })
    return () => {
      alive = false
      unsub?.()
    }
  }, [mode])

  const persist = useCallback(
    (next: RoadmapState, ids: string[], immediate = false) => {
      if (mode === 'shared' && writer.current) {
        for (const id of ids) writer.current.write(id, next[id], immediate ? 0 : 600)
        setSavedAt(new Date())
      } else if (mode === 'local' || mode === 'none') {
        const ok = saveState(next)
        if (ok) setSavedAt(new Date())
        else setMode('none')
      }
    },
    [mode],
  )

  const update = useCallback(
    (id: string, patch: Partial<ProjectState>) => {
      const prev = stateRef.current
      const next = { ...prev, [id]: { ...prev[id], ...patch, updatedAt: new Date().toISOString() } }
      setState(next)
      // Stato e scadenza sono click singoli: scrittura immediata. Il testo è coalescente.
      persist(next, [id], 'status' in patch || 'deadline' in patch)
    },
    [persist],
  )

  const replaceAll = useCallback(
    (raw: unknown) => {
      // Accetta sia il file esportato completo sia lo stato grezzo.
      const src = raw && typeof raw === 'object' && 'stato' in raw ? (raw as { stato: unknown }).stato : raw
      const next = sanitize(src)
      setState(next)
      persist(next, Object.keys(next), true)
    },
    [persist],
  )

  const reset = useCallback(() => {
    const next = initialState()
    setState(next)
    persist(next, Object.keys(next), true)
  }, [persist])

  return { state, update, replaceAll, reset, mode, savedAt, writeError }
}
