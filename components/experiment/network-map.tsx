import {
  EDGES,
  NODES,
  NODE_LABEL,
  STATUS_LABEL,
  edgeKey,
  type Edge,
  type NodeId,
  type Status,
  type WorldState,
} from '@/lib/simulation'
import { cn } from '@/lib/utils'

type Point = { x: number; y: number }

const DESKTOP: { viewBox: string; pos: Record<NodeId, Point> } = {
  viewBox: '0 0 1000 560',
  pos: {
    power: { x: 200, y: 150 },
    hospital: { x: 500, y: 80 },
    comms: { x: 800, y: 150 },
    water: { x: 110, y: 370 },
    traffic: { x: 370, y: 320 },
    data: { x: 630, y: 320 },
    transit: { x: 890, y: 370 },
    districts: { x: 500, y: 480 },
  },
}

const MOBILE: { viewBox: string; pos: Record<NodeId, Point> } = {
  viewBox: '0 0 360 500',
  pos: {
    hospital: { x: 180, y: 50 },
    power: { x: 64, y: 150 },
    comms: { x: 296, y: 150 },
    water: { x: 44, y: 300 },
    traffic: { x: 138, y: 262 },
    data: { x: 222, y: 262 },
    transit: { x: 316, y: 300 },
    districts: { x: 180, y: 430 },
  },
}

const NODE_STYLE: Record<Status, { ring: string; fill: string; text: string }> = {
  active: { ring: 'stroke-signal', fill: 'fill-signal', text: 'fill-signal' },
  recovered: { ring: 'stroke-signal', fill: 'fill-signal/15', text: 'fill-foreground' },
  affected: { ring: 'stroke-ember', fill: 'fill-ember/10', text: 'fill-ember' },
  offline: { ring: 'stroke-muted-foreground/40', fill: 'fill-background', text: 'fill-muted-foreground/60' },
}

type NetworkMapProps = {
  states: WorldState
  flows: Edge[]
  strains: Edge[]
  className?: string
}

export function NetworkMap({ states, flows, strains, className }: NetworkMapProps) {
  const flowKeys = new Set(flows.map(edgeKey))
  const strainKeys = new Set(strains.map(edgeKey))
  const summary = NODES.map((n) => `${n.label}: ${STATUS_LABEL[states[n.id]]}`).join('. ')

  return (
    <div className={cn('relative', className)} role="img" aria-label={`Network state. ${summary}.`}>
      <Graph layout={DESKTOP} short={false} states={states} flowKeys={flowKeys} strainKeys={strainKeys} className="hidden md:block" />
      <Graph layout={MOBILE} short states={states} flowKeys={flowKeys} strainKeys={strainKeys} className="md:hidden" />
    </div>
  )
}

function Graph({
  layout,
  short,
  states,
  flowKeys,
  strainKeys,
  className,
}: {
  layout: typeof DESKTOP
  short: boolean
  states: WorldState
  flowKeys: Set<string>
  strainKeys: Set<string>
  className?: string
}) {
  const { pos } = layout
  const r = short ? 13 : 16

  return (
    <svg viewBox={layout.viewBox} className={cn('h-auto w-full overflow-visible', className)} aria-hidden="true">
      <g>
        {EDGES.map((edge) => {
          const key = edgeKey(edge)
          const a = pos[edge[0]]
          const b = pos[edge[1]]
          const isFlow = flowKeys.has(key)
          const isStrain = !isFlow && strainKeys.has(key)
          return (
            <g key={key}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-foreground/8" strokeWidth={1} />
              {isFlow && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="edge-flow glow-signal stroke-signal"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )}
              {isStrain && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="edge-strain stroke-ember/70"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
            </g>
          )
        })}
      </g>

      {NODES.map((node) => {
        const p = pos[node.id]
        const status = states[node.id]
        const style = NODE_STYLE[status]
        const label = short ? node.short : NODE_LABEL[node.id]
        return (
          <g key={node.id} className="transition-opacity duration-700">
            {(status === 'active' || status === 'affected') && (
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                className={cn(
                  'node-pulse fill-none',
                  status === 'active' ? 'stroke-signal' : 'stroke-ember/70',
                )}
                strokeWidth={1}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              className={cn(
                'transition-all duration-700',
                style.ring,
                style.fill,
                status === 'active' && 'glow-signal',
                status === 'affected' && 'glow-ember',
              )}
              strokeWidth={1.5}
              strokeDasharray={status === 'offline' ? '3 4' : undefined}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={status === 'offline' ? 1.5 : 3}
              className={cn(
                'transition-all duration-700',
                status === 'active' ? 'fill-background' : status === 'affected' ? 'fill-ember' : status === 'recovered' ? 'fill-signal' : 'fill-muted-foreground/50',
              )}
            />
            <text
              x={p.x}
              y={p.y + r + (short ? 16 : 22)}
              textAnchor="middle"
              className={cn('font-mono uppercase transition-colors duration-700', style.text)}
              style={{ fontSize: short ? 11 : 13, letterSpacing: '0.14em' }}
            >
              {label}
            </text>
            <text
              x={p.x}
              y={p.y + r + (short ? 29 : 38)}
              textAnchor="middle"
              className="fill-muted-foreground font-mono uppercase"
              style={{ fontSize: short ? 8.5 : 10, letterSpacing: '0.16em' }}
            >
              {STATUS_LABEL[status]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function MapLegend({ className }: { className?: string }) {
  const items: { status: Status; hint: string; swatch: string }[] = [
    { status: 'active', hint: 'Your intervention', swatch: 'bg-signal shadow-[0_0_10px] shadow-signal' },
    { status: 'recovered', hint: 'Restored by the chain', swatch: 'border border-signal bg-signal/15' },
    { status: 'affected', hint: 'Under strain', swatch: 'border border-ember bg-ember/10' },
    { status: 'offline', hint: 'Down', swatch: 'border border-dashed border-muted-foreground/50' },
  ]
  return (
    <ul className={cn('flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground', className)}>
      {items.map((i) => (
        <li key={i.status} className="flex items-center gap-2">
          <span className={cn('inline-block size-2.5 rounded-full', i.swatch)} aria-hidden="true" />
          <span className="text-foreground/90">{STATUS_LABEL[i.status]}</span>
          <span className="sr-only">:</span>
          <span className="hidden sm:inline">{i.hint}</span>
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span className="inline-block h-px w-5 bg-signal" aria-hidden="true" />
        <span className="text-foreground/90">Signal</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="inline-block h-px w-5 border-t border-dashed border-ember" aria-hidden="true" />
        <span className="text-foreground/90">Strain</span>
      </li>
    </ul>
  )
}
