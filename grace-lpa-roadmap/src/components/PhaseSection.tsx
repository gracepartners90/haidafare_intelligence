import { PROJECTS, type Phase, type Project } from '../data/roadmap'
import { formatDate } from '../lib/dates'
import type { RoadmapState } from '../lib/storage'
import { PriorityBadge, StatusBadge } from './Badges'

interface Props {
  phase: Phase
  state: RoadmapState
  openIds: Set<string>
  onToggle: (id: string) => void
  onManage: (id: string) => void
}

export function PhaseSection({ phase, state, openIds, onToggle, onManage }: Props) {
  const projects = PROJECTS.filter((p) => p.phase === phase.id)
  const isFirst = phase.number === '01'

  return (
    <section id={phase.id} aria-labelledby={`${phase.id}-title`} className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">
              <span className={isFirst ? 'text-accent' : 'text-white'}>●</span> {phase.period}
            </p>
            <h2 id={`${phase.id}-title`} className="display mt-4">
              <span className="block text-[clamp(3.5rem,9vw,7.5rem)]">
                Fase <span className="text-outline">{phase.number}</span>
              </span>
              <span className="mt-3 block text-2xl text-soft sm:text-3xl">{phase.title}</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:self-end">
            <div className={`border-l-2 pl-5 ${isFirst ? 'border-accent' : 'border-white'}`}>
              <p className="eyebrow">Obiettivo</p>
              <p className="mt-2 text-lg leading-relaxed text-soft">{phase.objective}</p>
            </div>
          </div>
        </div>

        <ul className="mt-12 border-t border-line">
          {projects.map((p) => (
            <ProjectAccordion
              key={p.id}
              project={p}
              status={state[p.id].status}
              deadline={state[p.id].deadline}
              open={openIds.has(p.id)}
              onToggle={() => onToggle(p.id)}
              onManage={() => onManage(p.id)}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

function ProjectAccordion({
  project: p,
  status,
  deadline,
  open,
  onToggle,
  onManage,
}: {
  project: Project
  status: RoadmapState[string]['status']
  deadline: string
  open: boolean
  onToggle: () => void
  onManage: () => void
}) {
  const panelId = `progetto-${p.id}-panel`
  return (
    <li id={`progetto-${p.id}`} className="scroll-mt-24 border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          id={`progetto-${p.id}-button`}
          aria-controls={panelId}
          onClick={onToggle}
          className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-6 text-left sm:gap-8"
        >
          <span
            aria-hidden
            className={`display w-14 text-5xl transition-colors duration-200 sm:w-20 sm:text-6xl ${
              open ? 'text-accent' : 'text-outline group-hover:[-webkit-text-stroke-color:var(--color-soft)]'
            }`}
          >
            {p.id}
          </span>
          <span className="min-w-0">
            <span className="eyebrow block">
              Progetto {p.id} · {p.name}
            </span>
            <span className="display mt-1.5 block text-2xl sm:text-3xl lg:text-4xl">{p.title}</span>
            <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <PriorityBadge priority={p.priority} />
              <StatusBadge status={status} />
              {p.milestone && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-accent-soft">
                  ◆ {p.milestone.label} · {p.milestone.date}
                </span>
              )}
            </span>
          </span>
          <span
            aria-hidden
            className={`flex size-10 items-center justify-center border text-xl transition-all duration-200 ${
              open ? 'rotate-45 border-accent bg-accent text-white' : 'border-line text-mute group-hover:border-white group-hover:text-white'
            }`}
          >
            +
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={`progetto-${p.id}-button`} hidden={!open} className="pb-8 sm:pl-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Azioni</p>
            <ol className="mt-3 space-y-0">
              {p.actions.map((a, i) => (
                <li key={a} className="grid grid-cols-[2.25rem_1fr] border-t border-line py-3 text-soft first:border-t-0">
                  <span className="font-mono text-xs font-bold text-mute">{String(i + 1).padStart(2, '0')}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4 lg:col-span-5">
            {p.output && (
              <div className="border border-line bg-coal p-5">
                <p className="eyebrow">Output</p>
                <p className="mt-2 font-semibold">{p.output}</p>
              </div>
            )}
            {p.milestone && (
              <div className="border border-accent/60 p-5">
                <p className="eyebrow text-accent-soft">Scadenza evento</p>
                <p className="display mt-2 text-3xl">{p.milestone.date}</p>
                <p className="text-sm text-soft">{p.milestone.label}</p>
              </div>
            )}
            {p.caveat && (
              <p className="border-l-2 border-wait pl-4 text-sm text-soft">
                <span className="font-semibold text-wait">Nota · </span>
                {p.caveat}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                Scadenza <span className="font-bold text-white">{formatDate(deadline)}</span>
              </p>
              <button
                type="button"
                onClick={onManage}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent-soft"
              >
                Gestisci nel cruscotto →
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
