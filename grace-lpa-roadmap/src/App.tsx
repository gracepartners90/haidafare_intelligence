import { useCallback, useEffect, useRef, useState } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { PhaseSection } from './components/PhaseSection'
import { ProjectDashboard } from './components/ProjectDashboard'
import { ProjectOverview } from './components/ProjectOverview'
import { RoadmapTimeline } from './components/RoadmapTimeline'
import { PHASES } from './data/roadmap'
import { useRoadmapState } from './hooks/useRoadmapState'

export default function App() {
  const { state, update, replaceAll, reset, storageOk, savedAt } = useRoadmapState()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const scrollTo = (elId: string, focusSel?: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(elId)
      if (!el) return
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      const target = focusSel ? el.querySelector<HTMLElement>(focusSel) : null
      target?.focus({ preventScroll: true })
    })
  }

  /** Apre la scheda operativa del progetto nella sezione di fase. */
  const showDetails = useCallback((id: string) => {
    setOpenIds((prev) => new Set(prev).add(id))
    scrollTo(`progetto-${id}`, 'button[aria-expanded]')
  }, [])

  /** Porta alla card del progetto nel cruscotto, evidenziandola. */
  const manage = useCallback((id: string) => {
    setHighlightedId(id)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHighlightedId(null), 2200)
    scrollTo(`card-${id}`, 'input[type=radio]:checked')
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div id="top">
      <Header />
      <main id="main">
        <ProjectOverview state={state} onJump={showDetails} />
        <RoadmapTimeline onJump={showDetails} />
        {PHASES.map((phase) => (
          <PhaseSection key={phase.id} phase={phase} state={state} openIds={openIds} onToggle={toggle} onManage={manage} />
        ))}
        <ProjectDashboard
          state={state}
          onUpdate={update}
          onImport={replaceAll}
          onReset={reset}
          onShowDetails={showDetails}
          storageOk={storageOk}
          savedAt={savedAt}
          highlightedId={highlightedId}
        />
      </main>
      <Footer />
    </div>
  )
}
