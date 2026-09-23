import { useMemo, useRef, useState } from 'react'
import { LIVE_EVENT, PHASES, PRIORITIES, PROJECTS, STATUSES, type PhaseId, type Priority, type Status } from '../data/roadmap'
import { formatDate } from '../lib/dates'
import { exportCSV, exportJSON } from '../lib/export'
import type { ProjectState, RoadmapState } from '../lib/storage'
import { DeadlineChip, ProjectCard } from './ProjectCard'
import { ProgressIndicator } from './ProgressIndicator'

interface Props {
  state: RoadmapState
  onUpdate: (id: string, patch: Partial<ProjectState>) => void
  onImport: (raw: unknown) => void
  onReset: () => void
  onShowDetails: (id: string) => void
  storageOk: boolean
  savedAt: Date | null
  highlightedId: string | null
}

type PhaseFilter = 'ALL' | PhaseId

const select =
  'border border-line bg-ink px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:border-line-strong focus:border-white focus:outline-none'

export function ProjectDashboard({ state, onUpdate, onImport, onReset, onShowDetails, storageOk, savedAt, highlightedId }: Props) {
  const [phase, setPhase] = useState<PhaseFilter>('ALL')
  const [priority, setPriority] = useState<'ALL' | Priority>('ALL')
  const [status, setStatus] = useState<'ALL' | Status>('ALL')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          (phase === 'ALL' || p.phase === phase) &&
          (priority === 'ALL' || p.priority === priority) &&
          (status === 'ALL' || state[p.id].status === status),
      ),
    [phase, priority, status, state],
  )

  const upcoming = useMemo(
    () =>
      PROJECTS.filter((p) => state[p.id].status !== 'COMPLETATO').sort((a, b) =>
        state[a.id].deadline.localeCompare(state[b.id].deadline),
      ),
    [state],
  )

  const filtersActive = phase !== 'ALL' || priority !== 'ALL' || status !== 'ALL'

  async function handleImport(file: File) {
    try {
      onImport(JSON.parse(await file.text()))
      setImportMsg(`Importato: ${file.name}`)
    } catch {
      setImportMsg('File non valido: selezionare un JSON esportato da questa pagina.')
    }
  }

  return (
    <section id="cruscotto" aria-labelledby="cruscotto-title" className="border-b border-line bg-coal/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">
              <span className="text-accent">●</span> Operatività Grace
            </p>
            <h2 id="cruscotto-title" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">
              Cruscotto <span className="text-outline">progetti</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Esporta roadmap</span>
            <button
              type="button"
              onClick={() => exportJSON(state)}
              className="bg-white px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-accent hover:text-white"
            >
              ↓ JSON
            </button>
            <button
              type="button"
              onClick={() => exportCSV(state)}
              className="bg-white px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-accent hover:text-white"
            >
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Avviso persistenza: dati salvati solo nel browser corrente */}
        <div
          role="note"
          className="mt-8 flex flex-col gap-3 border border-wait/50 bg-wait/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-soft">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-wait">Salvataggio locale · </span>
            {storageOk ? (
              <>
                Gli aggiornamenti sono salvati <strong className="text-white">solo in questo browser</strong> e non sono
                condivisi con gli altri membri del team. Per allinearsi, esportare il JSON e importarlo sull’altro dispositivo.
              </>
            ) : (
              <strong className="text-white">
                Il browser non consente il salvataggio locale: le modifiche andranno perse alla chiusura della pagina. Esportare
                i dati prima di uscire.
              </strong>
            )}
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
              {savedAt && storageOk ? `Salvato ${savedAt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleImport(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="border border-line px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-soft hover:border-white hover:text-white"
            >
              Importa JSON
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Ripristinare tutti i progetti allo stato iniziale? Le modifiche salvate in questo browser andranno perse.')) onReset()
              }}
              className="border border-line px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-soft hover:border-accent hover:text-accent-soft"
            >
              Ripristina
            </button>
          </div>
        </div>
        {importMsg && (
          <p role="status" className="mt-2 font-mono text-[11px] text-soft">
            {importMsg}
          </p>
        )}

        <div className="mt-10 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <ProgressIndicator statuses={PROJECTS.map((p) => state[p.id].status)} />
          </div>
          <aside aria-labelledby="scadenze-title" className="border border-line bg-ink p-5 sm:p-6 xl:col-span-4">
            <h3 id="scadenze-title" className="eyebrow">
              Prossime scadenze
            </h3>
            <p className="mt-4 flex items-center justify-between gap-3 border-b border-accent/50 pb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-accent-soft">◆ {LIVE_EVENT.label}</span>
              <span className="font-mono text-[11px] font-bold text-white">{LIVE_EVENT.date.toUpperCase()}</span>
            </p>
            {upcoming.length === 0 ? (
              <p className="mt-4 text-sm text-soft">Tutti i progetti sono completati.</p>
            ) : (
              <ol className="mt-1">
                {upcoming.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
                    <span className="min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
                      <span className="text-mute">{p.id}</span> {p.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="hidden font-mono text-[10px] text-mute sm:inline">{formatDate(state[p.id].deadline)}</span>
                      <DeadlineChip deadline={state[p.id].deadline} done={false} />
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>

        {/* Filtri */}
        <div role="search" aria-label="Filtra progetti" className="mt-10 flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Fase" className="flex flex-wrap gap-1">
            {([{ id: 'ALL', label: 'Tutti i progetti' }, ...PHASES.map((p) => ({ id: p.id, label: p.label }))] as { id: PhaseFilter; label: string }[]).map(
              (f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={phase === f.id}
                  onClick={() => setPhase(f.id)}
                  className={`px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    phase === f.id ? 'bg-white text-ink' : 'text-mute hover:bg-graphite hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ),
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="eyebrow">Priorità</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as 'ALL' | Priority)} className={select}>
                <option value="ALL">Tutte</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="eyebrow">Stato</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | Status)} className={select}>
                <option value="ALL">Tutti</option>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setPhase('ALL')
                  setPriority('ALL')
                  setStatus('ALL')
                }}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent-soft underline underline-offset-4"
              >
                Azzera filtri
              </button>
            )}
          </div>
        </div>
        <p aria-live="polite" className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
          {filtered.length} di {PROJECTS.length} progetti
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6 border border-dashed border-line p-10 text-center">
            <p className="display text-3xl">Nessun progetto</p>
            <p className="mt-2 text-sm text-soft">Nessun progetto corrisponde ai filtri selezionati.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                value={state[p.id]}
                onChange={(patch) => onUpdate(p.id, patch)}
                onShowDetails={() => onShowDetails(p.id)}
                highlighted={highlightedId === p.id}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
