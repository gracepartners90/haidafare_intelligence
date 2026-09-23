import { STATUSES, type Status } from '../data/roadmap'
import { statusDot } from './Badges'

interface Props {
  statuses: Status[]
}

/** KPI + barra di avanzamento complessiva (progetti completati / totali). */
export function ProgressIndicator({ statuses }: Props) {
  const total = statuses.length
  const count = (s: Status) => statuses.filter((x) => x === s).length
  const done = count('COMPLETATO')
  const pct = total ? Math.round((done / total) * 100) : 0

  const kpis: { label: string; value: number; status?: Status }[] = [
    { label: 'Progetti totali', value: total },
    { label: 'Da avviare', value: count('DA_AVVIARE'), status: 'DA_AVVIARE' },
    { label: 'In corso', value: count('IN_CORSO'), status: 'IN_CORSO' },
    { label: 'Completati', value: done, status: 'COMPLETATO' },
  ]

  return (
    <div>
      <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4" aria-live="polite">
        {kpis.map((k, i) => (
          <div key={k.label} className="bg-ink p-5 sm:p-6">
            <dt className="flex items-center gap-2 eyebrow">
              {k.status && <span aria-hidden className={`size-2 rounded-full ${statusDot[k.status]}`} />}
              {k.label}
            </dt>
            <dd className={`display mt-3 text-6xl tabular-nums sm:text-7xl ${i === 0 ? 'text-outline' : ''}`}>
              {String(k.value).padStart(2, '0')}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 border border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p id="progress-label" className="eyebrow">
            Avanzamento complessivo · progetti completati
          </p>
          <p className="font-mono text-sm font-bold">
            <span className="display text-4xl tabular-nums">{pct}%</span>
            <span className="ml-2 text-mute">
              {done}/{total}
            </span>
          </p>
        </div>
        <div
          role="progressbar"
          aria-labelledby="progress-label"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mt-4 h-2 w-full bg-graphite"
        >
          <div className="h-full bg-done transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1" aria-label="Distribuzione per stato">
          {STATUSES.map((s) => (
            <li key={s.id} className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
              <span aria-hidden className={`size-2 rounded-full ${statusDot[s.id]}`} />
              {s.label} <span className="text-white">{count(s.id)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
