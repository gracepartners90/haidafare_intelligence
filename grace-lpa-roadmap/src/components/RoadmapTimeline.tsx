import { LIVE_EVENT, PHASES, PROJECTS } from '../data/roadmap'

const NODES = [
  { month: 'Ottobre', year: '2026', note: 'Avvio Fase 01' },
  { month: 'Novembre', year: '2026', note: `${LIVE_EVENT.label} · 15–17` },
  { month: 'Gennaio', year: '2027', note: 'Avvio Fase 02' },
  { month: 'Marzo', year: '2027', note: 'Chiusura roadmap' },
]

interface Props {
  onJump: (projectId: string) => void
}

/** Progressione OTT 2026 → NOV 2026 → GEN 2027 → MAR 2027. Dicembre non è una fase operativa. */
export function RoadmapTimeline({ onJump }: Props) {
  const lane = (phaseId: string) => PROJECTS.filter((p) => p.phase === phaseId)

  return (
    <section aria-labelledby="timeline-title" className="border-b border-line bg-coal">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2 id="timeline-title" className="display mt-3 text-4xl sm:text-5xl">
              Ottobre 2026 <span className="text-accent">→</span> Marzo 2027
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">2 fasi · 8 progetti · 1 evento chiave</p>
        </div>

        {/* Desktop / tablet: linea orizzontale */}
        <div className="mt-12 hidden md:block">
          <ol className="grid grid-cols-4">
            {NODES.map((n, i) => (
              <li key={n.month} className="relative pr-6">
                {i < NODES.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute top-[6px] right-0 left-3.5 h-0.5 ${
                      i === 0 ? 'bg-accent' : i === 1 ? 'border-t-2 border-dashed border-line-strong' : 'bg-white'
                    }`}
                  />
                )}
                <span
                  aria-hidden
                  className={`relative z-10 block size-3.5 border-2 ${
                    i === 1 ? 'rotate-45 border-accent bg-accent' : i < 2 ? 'border-accent bg-coal' : 'border-white bg-coal'
                  }`}
                />
                <p className="display mt-5 text-3xl lg:text-4xl">{n.month}</p>
                <p className="font-mono text-xs font-bold text-mute">{n.year}</p>
                <p className={`mt-2 text-xs ${i === 1 ? 'font-semibold text-accent-soft' : 'text-soft'}`}>{n.note}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid grid-cols-4">
            {PHASES.map((phase, i) => (
              <div key={phase.id} className="col-span-2 pr-6">
                <PhaseLane label={phase.label} period={phase.period} accent={i === 0} projects={lane(phase.id)} onJump={onJump} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: linea verticale */}
        <ol className="mt-10 space-y-0 md:hidden">
          {NODES.map((n, i) => (
            <li key={n.month} className="relative pb-8 pl-8 last:pb-0">
              {i < NODES.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute top-4 bottom-0 left-[6px] w-0.5 ${
                    i === 0 ? 'bg-accent' : i === 1 ? 'border-l border-dashed border-line-strong bg-transparent' : 'bg-white'
                  }`}
                />
              )}
              <span
                aria-hidden
                className={`absolute top-1 left-0 size-3.5 border-2 ${
                  i === 1 ? 'rotate-45 border-accent bg-accent' : i < 2 ? 'border-accent bg-coal' : 'border-white bg-coal'
                }`}
              />
              <p className="display text-2xl">
                {n.month} <span className="font-mono text-xs font-bold text-mute">{n.year}</span>
              </p>
              <p className={`text-xs ${i === 1 ? 'font-semibold text-accent-soft' : 'text-soft'}`}>{n.note}</p>
              {(i === 0 || i === 2) && (
                <div className="mt-4">
                  <PhaseLane
                    label={PHASES[i === 0 ? 0 : 1].label}
                    period={PHASES[i === 0 ? 0 : 1].period}
                    accent={i === 0}
                    projects={lane(PHASES[i === 0 ? 0 : 1].id)}
                    onJump={onJump}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function PhaseLane({
  label,
  period,
  accent,
  projects,
  onJump,
}: {
  label: string
  period: string
  accent: boolean
  projects: typeof PROJECTS
  onJump: (id: string) => void
}) {
  return (
    <div className={`border-l-2 pl-4 ${accent ? 'border-accent' : 'border-white'}`}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">
        {label} <span className="text-mute">· {period}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {projects.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onJump(p.id)}
              className="border border-line bg-ink px-2.5 py-1.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-soft transition-colors hover:border-white hover:text-white"
            >
              <span className={accent ? 'text-accent-soft' : 'text-white'}>{p.id}</span> {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
