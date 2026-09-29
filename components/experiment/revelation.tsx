'use client'

import { RotateCcw } from 'lucide-react'

export function Revelation({ onRestart }: { onRestart: () => void }) {
  return (
    <section
      aria-labelledby="revelation-title"
      className="relative isolate overflow-hidden border-t border-border px-6 py-28 text-center md:px-12 md:py-40"
    >
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--signal)_14%,transparent)_0%,transparent_60%)]"
        aria-hidden="true"
      />
      <p className="reveal text-[11px] uppercase tracking-[0.3em] text-muted-foreground">04 — The final revelation</p>
      <h2
        id="revelation-title"
        className="reveal mx-auto mt-10 max-w-4xl text-balance font-display text-4xl leading-tight [animation-delay:150ms] md:text-6xl"
      >
        {"You didn't control everything that happened."}{' '}
        <em className="text-signal">You changed what happened next.</em>
      </h2>
      <button
        type="button"
        onClick={onRestart}
        className="reveal mt-14 inline-flex items-center gap-4 border border-ember/70 px-6 py-4 text-xs uppercase tracking-[0.28em] text-foreground transition-colors [animation-delay:300ms] hover:bg-ember hover:text-primary-foreground"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Run the experiment again
      </button>
    </section>
  )
}
