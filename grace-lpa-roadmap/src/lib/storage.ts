import { PROJECTS, type Status } from '../data/roadmap'

/** Stato operativo di un progetto, modificabile dal team Grace. */
export interface ProjectState {
  status: Status
  owner: string
  notes: string
  nextStep: string
  deadline: string
  updatedAt: string | null
}

export type RoadmapState = Record<string, ProjectState>

/**
 * Persistenza locale: i dati restano SOLO nel browser corrente.
 * Nessuna sincronizzazione tra membri del team.
 */
export const STORAGE_KEY = 'grace-lpa-roadmap:v1'

export function initialState(): RoadmapState {
  return Object.fromEntries(
    PROJECTS.map((p) => [
      p.id,
      { status: 'DA_AVVIARE', owner: '', notes: '', nextStep: '', deadline: p.defaultDeadline, updatedAt: null },
    ]),
  )
}

const STATUS_IDS: Status[] = ['DA_AVVIARE', 'IN_CORSO', 'IN_ATTESA', 'COMPLETATO']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Unisce dati salvati/importati allo stato iniziale, scartando valori non validi. */
export function sanitize(raw: unknown): RoadmapState {
  const base = initialState()
  if (!raw || typeof raw !== 'object') return base
  for (const id of Object.keys(base)) {
    const v = (raw as Record<string, unknown>)[id]
    if (!v || typeof v !== 'object') continue
    const r = v as Partial<Record<keyof ProjectState, unknown>>
    const str = (x: unknown) => (typeof x === 'string' ? x : undefined)
    base[id] = {
      status: STATUS_IDS.includes(r.status as Status) ? (r.status as Status) : base[id].status,
      owner: str(r.owner) ?? '',
      notes: str(r.notes) ?? '',
      nextStep: str(r.nextStep) ?? '',
      deadline: str(r.deadline) && ISO_DATE.test(r.deadline as string) ? (r.deadline as string) : base[id].deadline,
      updatedAt: str(r.updatedAt) ?? null,
    }
  }
  return base
}

export function loadState(): { state: RoadmapState; available: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return { state: raw ? sanitize(JSON.parse(raw)) : initialState(), available: true }
  } catch {
    return { state: initialState(), available: false }
  }
}

export function saveState(state: RoadmapState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
