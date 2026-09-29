import { ArrowDown } from 'lucide-react'
import { HeroNetwork } from './hero-network'

export function Hero() {
  return (
    <header className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <HeroNetwork />
      </div>
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_55%_40%,transparent_35%,var(--background)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-background via-background/70 to-transparent"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between px-6 pt-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground md:px-12 md:pt-10">
        <span>Exp. 01</span>
        <span>An experiment in consequences</span>
      </div>

      <div className="mt-auto px-6 pb-14 md:px-12 md:pb-20">
        <h1>
          <span className="reveal flex items-center gap-4 text-sm uppercase tracking-[0.4em] text-ember md:text-base">
            <span className="inline-block h-px w-10 bg-ember" aria-hidden="true" />
            The Butterfly Effect
          </span>
          <span className="sr-only">: </span>
          <span className="reveal mt-6 block max-w-5xl text-balance font-display text-6xl leading-[0.92] tracking-tight text-foreground [animation-delay:120ms] sm:text-7xl md:text-8xl lg:text-9xl">
            One choice can change <em className="text-signal">everything.</em>
          </span>
        </h1>
        <div className="reveal mt-10 flex flex-col gap-8 [animation-delay:260ms] md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Enter a simulated world. Make a decision. Discover the consequences.
          </p>
          <a
            href="#simulation"
            className="group inline-flex items-center justify-between gap-6 border border-signal/60 bg-signal/10 px-6 py-4 text-xs uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-signal hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 md:min-w-80"
          >
            Enter the simulation
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  )
}
