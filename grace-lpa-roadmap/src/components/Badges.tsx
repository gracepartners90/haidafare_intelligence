import type { Priority, Status } from '../data/roadmap'
import { statusLabel } from '../data/roadmap'

const priorityStyle: Record<Priority, string> = {
  ALTA: 'border-accent text-accent-soft',
  MEDIA: 'border-line-strong text-soft',
  STRATEGICA: 'border-white text-white',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em] ${priorityStyle[priority]}`}
    >
      {priority === 'STRATEGICA' && <span aria-hidden>★</span>}
      <span className="sr-only">Priorità </span>
      {priority}
    </span>
  )
}

export const statusDot: Record<Status, string> = {
  DA_AVVIARE: 'bg-transparent ring-1 ring-inset ring-mute',
  IN_CORSO: 'bg-accent',
  IN_ATTESA: 'bg-wait',
  COMPLETATO: 'bg-done',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-soft">
      <span aria-hidden className={`size-2 rounded-full ${statusDot[status]}`} />
      <span className="sr-only">Stato: </span>
      {statusLabel(status)}
    </span>
  )
}
