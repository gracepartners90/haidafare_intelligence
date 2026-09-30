const fmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatDate = (iso: string) => fmt.format(new Date(`${iso}T00:00:00`)).toUpperCase()

/** Giorni tra oggi e la data indicata (negativo se passata). */
export function daysUntil(iso: string, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const d = new Date(`${iso}T00:00:00`).getTime()
  return Math.round((d - t) / 86_400_000)
}
