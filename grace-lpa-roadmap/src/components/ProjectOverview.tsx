import { PILLARS, phaseById, projectById } from '../data/roadmap'
import type { RoadmapState } from '../lib/storage'
import { StatusBadge } from './Badges'

interface Props {
  state: RoadmapState
  onJump: (projectId: string) => void
}

export function ProjectOverview({ state, onJump }: Props) {
  return (
    <section id="overview" aria-labelledby="overview-title" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="eyebrow lg:col-span-3">
            <span className="text-accent">●</span> Overview
          </p>
          <div className="lg:col-span-9">
            <h2 id="overview-title" className="display text-[clamp(2.6rem,6.5vw,5.75rem)] leading-[0.98]">
              Consolidare l’Academy.
              <br />
              <span className="text-soft">Valorizzare il brand.</span>
              <br />
              Preparare <span className="text-accent">l’espansione.</span>
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-soft">
              Un programma di interventi coordinati per migliorare l’esperienza digitale, sostenere le vendite dei
              percorsi annuali e sviluppare nuove opportunità di business.
            </p>
          </div>
        </div>

        <ol className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <li key={pillar.number} className="group relative flex flex-col bg-ink p-6 transition-colors duration-200 hover:bg-coal">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
              />
              <span aria-hidden className="display text-outline text-7xl transition-colors duration-200 group-hover:[-webkit-text-stroke-color:var(--color-accent)]">
                {pillar.number}
              </span>
              <h3 className="display mt-6 text-3xl">
                <span className="sr-only">{pillar.number} — </span>
                {pillar.name}
              </h3>
              <p className="mt-2 text-sm text-soft">{pillar.description}</p>
              <ul className="mt-auto space-y-1 pt-8" aria-label={`Progetti collegati a ${pillar.name}`}>
                {pillar.projectIds.map((id) => {
                  const p = projectById(id)
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onJump(id)}
                        className="flex w-full items-center justify-between gap-3 border-t border-line py-2.5 text-left transition-colors hover:border-line-strong"
                      >
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                          P{id} <span className="text-mute">· {phaseById(p.phase).label}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <StatusBadge status={state[id].status} />
                          <span aria-hidden className="text-mute transition-transform duration-200 group-hover:translate-x-0.5">
                            →
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
