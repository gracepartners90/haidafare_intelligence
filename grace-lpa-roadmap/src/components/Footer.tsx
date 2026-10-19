export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <p className="display text-4xl sm:text-5xl">
            Grace &amp; Partners <span className="text-accent">×</span>
            <br />
            Luca Picchio Academy
          </p>
          <p className="mt-4 max-w-md text-sm text-mute">
            Roadmap interna di sviluppo · ottobre 2026 – marzo 2027. Documento riservato al team Grace &amp; Partners, non
            destinato alla diffusione esterna.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <span className="border border-accent px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-soft">
            Internal use only
          </span>
          <a href="#top" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-mute hover:text-white">
            Torna su ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
