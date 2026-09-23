import { PROJECTS, phaseById, statusLabel } from '../data/roadmap'
import { getRuntime } from './sharedStore'
import type { RoadmapState } from './storage'

function rows(state: RoadmapState) {
  return PROJECTS.map((p) => {
    const s = state[p.id]
    return {
      numero: p.id,
      progetto: p.title,
      fase: phaseById(p.phase).label,
      periodo: phaseById(p.phase).period,
      priorita: p.priority,
      scadenza: s.deadline,
      milestone: p.milestone ? `${p.milestone.label} ${p.milestone.date}` : '',
      stato: statusLabel(s.status).toUpperCase(),
      referente_grace: s.owner,
      prossimo_step: s.nextStep,
      note: s.notes,
      sintesi: p.summary,
      azioni: p.actions.join(' | '),
      output: p.output ?? '',
      ultimo_aggiornamento: s.updatedAt ?? '',
    }
  })
}

export type ExportResult = 'saved' | 'declined' | 'error'

/**
 * In un Artifact i download diretti sono bloccati: si passa dalla capability
 * `downloads` (il browser chiede conferma). In locale si usa il classico link.
 */
async function download(filename: string, content: string, type: string): Promise<ExportResult> {
  const rt = getRuntime()
  if (rt) {
    const dl = (await rt.use('downloads').catch(() => null)) as { save(r: { filename: string; data: string }): Promise<unknown> } | null
    if (dl) {
      try {
        await dl.save({ filename, data: content })
        return 'saved'
      } catch (e) {
        return (e as { code?: string })?.code === 'declined' ? 'declined' : 'error'
      }
    }
  }
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return 'saved'
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportJSON(state: RoadmapState) {
  const payload = {
    documento: 'Roadmap 2026/2027 — Grace & Partners × Luca Picchio Academy',
    uso: 'INTERNAL USE ONLY',
    esportato_il: new Date().toISOString(),
    progetti: rows(state),
    // Stato grezzo, reimportabile dal pulsante "Importa JSON".
    stato: state,
  }
  return download(`roadmap-lpa-${stamp()}.json`, JSON.stringify(payload, null, 2), 'application/json')
}

export function exportCSV(state: RoadmapState) {
  const data = rows(state)
  const headers = Object.keys(data[0])
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
  const lines = [headers.join(';'), ...data.map((r) => headers.map((h) => esc(String(r[h as keyof typeof r]))).join(';'))]
  // BOM + separatore ';' per l'apertura corretta in Excel con locale italiano.
  return download(`roadmap-lpa-${stamp()}.csv`, '\uFEFF' + lines.join('\r\n'), 'text/csv;charset=utf-8')
}
