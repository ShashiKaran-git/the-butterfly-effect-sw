import { NODES, NODE_LABEL, STATUS_LABEL, diffStates, type Stage, type Status } from '@/lib/simulation'
import { cn } from '@/lib/utils'
import type { Run } from './experiment'

const CHIP: Record<Status, string> = {
  active: 'border-signal bg-signal text-primary-foreground',
  recovered: 'border-signal/60 bg-signal/10 text-foreground',
  affected: 'border-ember/60 bg-ember/10 text-ember',
  offline: 'border-dashed border-muted-foreground/40 text-muted-foreground',
}

export function ConsequenceChain({ run, path }: { run: Run; path: Stage[] }) {
  const complete = run.step === 3
  const decisions = [run.choice?.label, run.fork?.label]
  const final = path[path.length - 1].states
  const held = NODES.filter((n) => final[n.id] === 'recovered' || final[n.id] === 'active').length

  return (
    <section
      id="consequences"
      aria-labelledby="consequences-title"
      className="border-t border-border px-6 py-20 md:px-12 md:py-28"
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">03 — The consequence map</p>
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="consequences-title" className="font-display text-5xl leading-none md:text-7xl">
          Cause, then effect, then effect.
        </h2>
        {complete && (
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <span className="text-signal">{held}</span> of {NODES.length} systems holding at T-00:00
          </p>
        )}
      </div>

      {path.length === 1 ? (
        <p className="mt-12 max-w-md border-l border-border pl-4 text-sm leading-relaxed text-muted-foreground">
          No chain yet. Make your first decision in the simulation above and every consequence it sets in
          motion will be traced here.
        </p>
      ) : (
        <ol className="relative mt-14 grid gap-0 md:grid-cols-4">
          {path.map((stage, i) => {
            const changes = i === 0 ? [] : diffStates(path[i - 1].states, stage.states)
            const decision = decisions[i - 1]
            return (
              <li key={stage.clock} className="reveal relative pb-10 pl-8 md:pb-0 md:pl-0 md:pr-6" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="absolute left-[5px] top-3 h-full w-px bg-border md:left-0 md:top-[5px] md:h-px md:w-full" aria-hidden="true" />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 size-[11px] rounded-full border md:top-0',
                    i === path.length - 1 ? 'border-ember bg-ember glow-ember' : 'border-signal bg-signal/30',
                  )}
                  aria-hidden="true"
                />
                <div className="md:pt-8">
                  <p className="font-mono text-sm tabular-nums text-ember">{stage.clock}</p>
                  {decision && (
                    <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-signal">
                      <span className="text-muted-foreground">You chose — </span>
                      {decision}
                    </p>
                  )}
                  <h3 className="mt-3 font-display text-2xl leading-tight">{stage.title}</h3>
                  {i === 0 ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      Starting conditions. Most of the city is affected or offline.
                    </p>
                  ) : changes.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Systems that changed">
                      {changes.map((c) => (
                        <li
                          key={c.id}
                          className={cn('border px-2 py-1 text-[10px] uppercase tracking-[0.14em]', CHIP[c.to])}
                        >
                          {NODE_LABEL[c.id]}
                          <span className="opacity-70">
                            {' '}
                            {STATUS_LABEL[c.from]} {'→'} {STATUS_LABEL[c.to]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">No system changed state.</p>
                  )}
                </div>
              </li>
            )
          })}
          {!complete &&
            Array.from({ length: 4 - path.length }).map((_, i) => (
              <li key={`pending-${i}`} className="relative pb-10 pl-8 opacity-40 md:pb-0 md:pl-0 md:pr-6">
                <span className="absolute left-[5px] top-3 h-full w-px border-l border-dashed border-border md:left-0 md:top-[5px] md:h-px md:w-full md:border-l-0 md:border-t" aria-hidden="true" />
                <span className="absolute left-0 top-1.5 size-[11px] rounded-full border border-dashed border-muted-foreground md:top-0" aria-hidden="true" />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground md:pt-8">Not yet written</p>
              </li>
            ))}
        </ol>
      )}
    </section>
  )
}
