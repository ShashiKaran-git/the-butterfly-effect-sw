const THEMES = [
  {
    title: 'Decision-making',
    body: 'Every run asks for two choices with incomplete information and no perfect answer.',
  },
  {
    title: 'Cascading consequences',
    body: 'Systems are connected. Helping one shifts the load onto another, sometimes in ways you could not see coming.',
  },
  {
    title: 'Systems thinking',
    body: 'The map shows relationships, not just parts. The interesting behavior lives in the connections.',
  },
]

export function About() {
  return (
    <section aria-labelledby="about-title" className="border-t border-border px-6 pb-12 pt-20 md:px-12 md:pt-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">05 — About the experiment</p>
          <h2 id="about-title" className="mt-4 font-display text-5xl leading-none md:text-6xl">
            A small study in <em className="text-ember">what follows.</em>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            The Butterfly Effect is a small interactive project. Its city, systems, and outcomes are entirely
            fictional, written to explore how one modest decision can ripple outward into consequences no one
            fully controls.
          </p>
        </div>
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {THEMES.map((t, i) => (
            <li key={t.title} className="bg-background p-6">
              <p className="font-mono text-xs tabular-nums text-signal">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-6 text-sm uppercase tracking-[0.16em]">{t.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-24 flex flex-col gap-4 border-t border-border pt-8 text-[11px] uppercase tracking-[0.24em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Created by <span className="text-foreground">Shashi</span>
        </p>
        <p>The Butterfly Effect — An experiment in consequences</p>
      </div>
    </section>
  )
}
