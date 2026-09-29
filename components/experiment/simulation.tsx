'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { CHOICES, type Choice, type Fork, type Stage } from '@/lib/simulation'
import { cn } from '@/lib/utils'
import { MapLegend, NetworkMap } from './network-map'
import type { Run } from './experiment'

type SimulationProps = {
  run: Run
  path: Stage[]
  runCount: number
  onChoose: (id: Choice['id']) => void
  onFork: (fork: Fork) => void
  onAdvance: () => void
  onRestart: () => void
}

const STEPS = ['Briefing', 'First choice', 'Second choice', 'Outcome']

export function Simulation({ run, path, runCount, onChoose, onFork, onAdvance, onRestart }: SimulationProps) {
  const stage = path[path.length - 1]
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (run.step > 0) headingRef.current?.focus({ preventScroll: true })
  }, [run.step])

  return (
    <section
      id="simulation"
      aria-labelledby="simulation-title"
      className="relative scroll-mt-0 border-t border-border px-6 py-20 md:px-12 md:py-28"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            02 — Interactive simulation · Run {String(runCount).padStart(2, '0')}
          </p>
          <h2 id="simulation-title" className="mt-4 font-display text-5xl leading-none md:text-7xl">
            The Last Three Minutes
          </h2>
        </div>
        <p className="max-w-sm border-l border-ember/60 pl-4 text-xs leading-relaxed text-muted-foreground">
          <span className="text-ember">Fictional experiment.</span> Meridian is an invented city. This is
          not a real emergency or monitoring system, and nothing here reflects real infrastructure data.
        </p>
      </div>

      <ol className="mt-12 grid grid-cols-4 gap-2" aria-label="Simulation progress">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === run.step ? 'step' : undefined}>
            <span
              className={cn(
                'block h-px w-full transition-colors duration-700',
                i < run.step ? 'bg-signal' : i === run.step ? 'bg-ember' : 'bg-border',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'mt-3 block text-[10px] uppercase tracking-[0.2em] md:text-[11px]',
                i === run.step ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{String(i + 1).padStart(2, '0')}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="flex flex-col">
          <div key={stage.clock + stage.title} className="reveal" aria-live="polite">
            <p className="font-mono text-4xl tabular-nums tracking-tight text-ember md:text-5xl">
              <span className="sr-only">Simulated time remaining: </span>
              {stage.clock}
            </p>
            <h3
              ref={headingRef}
              tabIndex={-1}
              className="mt-6 text-balance font-display text-3xl leading-tight outline-none md:text-4xl"
            >
              {stage.title}
            </h3>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
          </div>

          <div className="mt-10">
            {run.step === 0 && (
              <DecisionGroup
                prompt="Where do you act first?"
                options={CHOICES.map((c) => ({ key: c.id, label: c.label, detail: c.detail, onSelect: () => onChoose(c.id) }))}
              />
            )}
            {run.step === 1 && run.choice && (
              <DecisionGroup
                prompt={run.choice.forkPrompt}
                options={run.choice.forks.map((f) => ({
                  key: f.id,
                  label: f.label,
                  detail: f.detail,
                  onSelect: () => onFork(f),
                }))}
              />
            )}
            {run.step === 2 && (
              <button
                type="button"
                onClick={onAdvance}
                className="group flex w-full items-center justify-between border border-signal/60 bg-signal/10 px-5 py-4 text-left text-xs uppercase tracking-[0.24em] transition-colors hover:bg-signal hover:text-primary-foreground"
              >
                Let the final minute unfold
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            )}
            {run.step === 3 && run.fork && (
              <div className="reveal border border-signal/40 bg-surface/60 p-6">
                <p className="text-[11px] uppercase tracking-[0.3em] text-signal">Outcome</p>
                <p className="mt-3 font-display text-3xl">{run.fork.outcome.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{run.fork.outcome.summary}</p>
                <a
                  href="#consequences"
                  className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-foreground underline-offset-8 hover:underline"
                >
                  Trace the consequence map
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {run.step > 0 && (
            <button
              type="button"
              onClick={onRestart}
              className="mt-6 inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Restart experiment
            </button>
          )}
        </div>

        <div className="relative border border-border bg-surface/40 p-4 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <span>Meridian · systems network</span>
            <span>Simulated</span>
          </div>
          <NetworkMap
            states={stage.states}
            flows={stage.flows}
            strains={stage.strains}
            className="relative mt-6"
          />
          <MapLegend className="relative mt-8 border-t border-border pt-5" />
        </div>
      </div>
    </section>
  )
}

function DecisionGroup({
  prompt,
  options,
}: {
  prompt: string
  options: { key: string; label: string; detail: string; onSelect: () => void }[]
}) {
  return (
    <fieldset className="reveal">
      <legend className="text-[11px] uppercase tracking-[0.28em] text-ember">{prompt}</legend>
      <div className="mt-4 flex flex-col border-t border-border">
        {options.map((o, i) => (
          <button
            key={o.key}
            type="button"
            onClick={o.onSelect}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border px-1 py-5 text-left transition-colors hover:bg-signal/5 focus-visible:bg-signal/5"
          >
            <span className="font-mono text-xs text-muted-foreground tabular-nums group-hover:text-signal">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>
              <span className="block text-sm text-foreground md:text-base">{o.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{o.detail}</span>
            </span>
            <ArrowRight
              className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-signal"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </fieldset>
  )
}
