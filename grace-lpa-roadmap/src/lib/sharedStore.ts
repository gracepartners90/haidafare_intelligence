import { PROJECTS } from '../data/roadmap'
import { sanitize, type ProjectState, type RoadmapState } from './storage'

/**
 * Archivio condiviso: disponibile solo quando la pagina è pubblicata come
 * Artifact claude.ai con la capability `db`. In locale `window.claude` non
 * esiste e la pagina resta sul salvataggio del browser.
 */

type Snap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined }
type DocRef = { set(data: Record<string, unknown>): Promise<void> }
type Collection = {
  doc(id: string): DocRef
  onSnapshot(next: (s: { docs: Snap[] }) => void, error?: (e: { code: string }) => void): () => void
}
type DB = { collection(path: string): Collection }
type ClaudeRuntime = { use(name: string): Promise<unknown> }

const COLLECTION = 'progetti'

export function getRuntime(): ClaudeRuntime | null {
  const c = (window as unknown as { claude?: ClaudeRuntime }).claude
  return c && typeof c.use === 'function' ? c : null
}

export async function connectDb(): Promise<DB | null> {
  const rt = getRuntime()
  if (!rt) return null
  try {
    return ((await rt.use('db')) as DB | null) ?? null
  } catch {
    return null
  }
}

export function subscribe(db: DB, onState: (partial: Record<string, unknown>) => void, onError: () => void) {
  return db.collection(COLLECTION).onSnapshot(
    (snap) => {
      const raw: Record<string, unknown> = {}
      for (const d of snap.docs) if (d.exists) raw[d.id] = d.data()
      onState(raw)
    },
    () => onError(),
  )
}

/**
 * Scritture coalescenti: una sola scrittura in volo per documento, con
 * debounce sulla digitazione. `pending` indica i documenti con modifiche
 * locali non ancora confermate (da non sovrascrivere con gli snapshot).
 */
export function createWriter(db: DB, onFail: (id: string) => void) {
  const timers = new Map<string, number>()
  const latest = new Map<string, ProjectState>()
  const inflight = new Map<string, Promise<void>>()
  const pending = new Set<string>()

  const flush = (id: string) => {
    timers.delete(id)
    const prev = inflight.get(id) ?? Promise.resolve()
    const run = prev.then(async () => {
      const value = latest.get(id)
      if (!value) return
      latest.delete(id)
      try {
        await db.collection(COLLECTION).doc(id).set({ ...value })
      } catch {
        onFail(id)
      }
    })
    inflight.set(id, run)
    void run.finally(() => {
      if (inflight.get(id) === run) {
        inflight.delete(id)
        if (!latest.has(id) && !timers.has(id)) pending.delete(id)
      }
    })
  }

  return {
    pending,
    write(id: string, value: ProjectState, delay = 600) {
      latest.set(id, value)
      pending.add(id)
      window.clearTimeout(timers.get(id))
      timers.set(id, window.setTimeout(() => flush(id), delay))
    },
    writeAll(state: RoadmapState) {
      for (const p of PROJECTS) this.write(p.id, state[p.id], 0)
    },
  }
}

/** Stato completo a partire dai documenti condivisi (assenti = valori iniziali). */
export const fromDocs = (raw: Record<string, unknown>) => sanitize(raw)
