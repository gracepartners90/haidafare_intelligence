import { STATUSES, type Status } from '../data/roadmap'
import { statusDot } from './Badges'

const active: Record<Status, string> = {
  DA_AVVIARE: 'bg-white text-ink border-white',
  IN_CORSO: 'bg-accent text-white border-accent',
  IN_ATTESA: 'bg-wait text-ink border-wait',
  COMPLETATO: 'bg-done text-ink border-done',
}

interface Props {
  value: Status
  onChange: (s: Status) => void
  name: string
  label?: string
}

/** Selettore di stato a 4 opzioni, implementato come radio group accessibile. */
export function StatusSelector({ value, onChange, name, label = 'Stato di avanzamento' }: Props) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2">{label}</legend>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {STATUSES.map((s) => {
          const checked = s.id === value
          return (
            <label
              key={s.id}
              className={`flex cursor-pointer items-center justify-center gap-1.5 border px-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-soft ${
                checked ? active[s.id] : 'border-line text-mute hover:border-line-strong hover:text-white'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={s.id}
                checked={checked}
                onChange={() => onChange(s.id)}
              />
              {!checked && <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${statusDot[s.id]}`} />}
              {s.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
