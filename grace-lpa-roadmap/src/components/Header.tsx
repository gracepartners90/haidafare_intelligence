import { useEffect, useState } from 'react'
import { BRAND } from '../data/roadmap'

export const NAV: { id: string; label: string; short?: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'fase-01', label: 'Fase 01' },
  { id: 'fase-02', label: 'Fase 02' },
  { id: 'cruscotto', label: 'Cruscotto progetti', short: 'Cruscotto' },
]

const NAV_IDS = NAV.map((n) => n.id)

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])
  return active
}

function LogoSlot() {
  if (BRAND.logoSrc) return <img src={BRAND.logoSrc} alt={BRAND.logoAlt} className="h-8 w-auto" />
  return (
    <div
      className="flex h-9 w-24 shrink-0 items-center justify-center border border-dashed border-line-strong font-mono text-[9px] leading-tight text-mute"
      title="Inserire l’asset originale del logo Luca Picchio Academy (vedi src/data/roadmap.ts → BRAND.logoSrc)"
    >
      LOGO LPA
    </div>
  )
}

export function Header() {
  const active = useActiveSection(NAV_IDS)
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-ink">
        Vai al contenuto
      </a>
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-line bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <LogoSlot />
          <p className="hidden font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-soft lg:block">
            Grace &amp; Partners <span className="text-accent">×</span> Luca Picchio Academy
          </p>
          <nav aria-label="Sezioni" className="ml-auto -mr-2 overflow-x-auto">
            <ul className="flex whitespace-nowrap">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={active === n.id ? 'location' : undefined}
                    className={`relative block px-2.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors sm:px-3 ${
                      active === n.id ? 'text-white' : 'text-mute hover:text-white'
                    }`}
                  >
                    {n.short ? (
                      <>
                        <span className="sm:hidden">{n.short}</span>
                        <span className="hidden sm:inline">{n.label}</span>
                      </>
                    ) : (
                      n.label
                    )}
                    <span
                      aria-hidden
                      className={`absolute inset-x-2.5 -bottom-[13px] h-0.5 bg-accent transition-transform duration-200 sm:inset-x-3 ${
                        active === n.id ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="grille absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 sm:pt-14 lg:px-10 lg:pt-20 lg:pb-20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-soft">
              Grace &amp; Partners <span className="text-accent">×</span> Luca Picchio Academy
            </p>
            <span className="inline-flex items-center gap-2 border border-accent px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-soft">
              <span aria-hidden className="size-1.5 bg-accent" />
              Internal use only
            </span>
          </div>
          <h1 id="hero-title" className="display mt-8 text-[clamp(4.5rem,17vw,13rem)]">
            Roadmap
            <span className="flex items-baseline gap-[0.15em]">
              <span>2026</span>
              <span className="text-accent">/</span>
              <span className="text-outline">2027</span>
            </span>
          </h1>
          <div className="mt-8 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-lg text-soft">Piano interno di sviluppo e coordinamento progetti.</p>
            <dl className="grid grid-cols-3 gap-6 font-mono text-xs uppercase tracking-[0.14em]">
              <div>
                <dt className="text-mute">Periodo</dt>
                <dd className="mt-1 font-bold text-white">Ott 26 → Mar 27</dd>
              </div>
              <div>
                <dt className="text-mute">Fasi</dt>
                <dd className="mt-1 font-bold text-white">02</dd>
              </div>
              <div>
                <dt className="text-mute">Progetti</dt>
                <dd className="mt-1 font-bold text-white">08</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
