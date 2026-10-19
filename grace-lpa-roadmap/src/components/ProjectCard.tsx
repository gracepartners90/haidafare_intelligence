import { phaseById, type Project } from '../data/roadmap'
import { daysUntil, formatDate } from '../lib/dates'
import type { ProjectState } from '../lib/storage'
import { PriorityBadge } from './Badges'
import { StatusSelector } from './StatusSelector'

interface Props {
  project: Project
  value: ProjectState
  onChange: (patch: Partial<ProjectState>) => void
  onShowDetails: () => void
  highlighted?: boolean
}

export function DeadlineChip({ deadline, done }: { deadline: string; done: boolean }) {
  if (done) return <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-done">Chiuso</span>
  const d = daysUntil(deadline)
  const cls = d < 0 ? 'bg-accent text-white' : d <= 14 ? 'bg-wait text-ink' : 'border border-line text-soft'
  const label = d < 0 ? `Scaduto da ${-d} gg` : d === 0 ? 'Scade oggi' : `Tra ${d} gg`
  return <span className={`px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${cls}`}>{label}</span>
}

const field =
  'w-full border border-line bg-ink px-3 py-2 text-sm text-white placeholder:text-mute/70 transition-colors hover:border-line-strong focus:border-white focus:outline-none'

export function ProjectCard({ project: p, value, onChange, onShowDetails, highlighted }: Props) {
  const id = `card-${p.id}`
  const phase = phaseById(p.phase)
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className={`flex scroll-mt-24 flex-col border bg-coal transition-[border-color,box-shadow] duration-500 ${
        highlighted ? 'border-accent shadow-[0_0_0_3px_rgb(227_33_43_/_0.25)]' : 'border-line'
      }`}
    >
      <header className="flex items-start gap-4 border-b border-line p-5">
        <span aria-hidden className="display text-5xl text-outline">
          {p.id}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">
            {phase.label} · {phase.period}
          </p>
          <h3 id={`${id}-title`} className="display mt-1.5 text-2xl leading-none">
            <span className="sr-only">Progetto {p.id}: </span>
            {p.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={p.priority} />
            {p.milestone && (
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent-soft">
                ◆ Live {p.milestone.date}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-5 p-5">
        <div>
          <p className="eyebrow">Sintesi azioni</p>
          <p className="mt-1.5 text-sm leading-relaxed text-soft">{p.summary}</p>
          <button
            type="button"
            onClick={onShowDetails}
            className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-mute underline underline-offset-4 hover:text-white"
          >
            Dettaglio azioni ↑
          </button>
        </div>

        <StatusSelector name={`status-${p.id}`} value={value.status} onChange={(status) => onChange({ status })} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-owner`} className="eyebrow">
              Referente Grace
            </label>
            <input
              id={`${id}-owner`}
              type="text"
              value={value.owner}
              onChange={(e) => onChange({ owner: e.target.value })}
              placeholder="Da assegnare"
              className={`${field} mt-2`}
              autoComplete="off"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={`${id}-deadline`} className="eyebrow">
                Scadenza
              </label>
              <DeadlineChip deadline={value.deadline} done={value.status === 'COMPLETATO'} />
            </div>
            <input
              id={`${id}-deadline`}
              type="date"
              value={value.deadline}
              min="2026-10-01"
              max="2027-03-31"
              onChange={(e) => e.target.value && onChange({ deadline: e.target.value })}
              className={`${field} mt-2 font-mono [color-scheme:dark]`}
              aria-describedby={`${id}-deadline-hint`}
            />
            <p id={`${id}-deadline-hint`} className="sr-only">
              Scadenza attuale {formatDate(value.deadline)}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-next`} className="eyebrow">
            Prossimo step
          </label>
          <input
            id={`${id}-next`}
            type="text"
            value={value.nextStep}
            onChange={(e) => onChange({ nextStep: e.target.value })}
            placeholder="Es. call di kick-off, invio brief…"
            className={`${field} mt-2`}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor={`${id}-notes`} className="eyebrow">
            Note operative
          </label>
          <textarea
            id={`${id}-notes`}
            value={value.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={3}
            placeholder="Decisioni, blocchi, riferimenti…"
            className={`${field} mt-2 resize-y`}
          />
        </div>
      </div>

      <footer className="mt-auto border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
        {value.updatedAt
          ? `Ultimo aggiornamento ${new Date(value.updatedAt).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}`
          : 'Nessun aggiornamento'}
      </footer>
    </article>
  )
}
