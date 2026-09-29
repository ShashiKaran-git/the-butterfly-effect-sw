type HeroNode = { id: number; x: number; y: number; level: number }
type HeroEdge = { a: HeroNode; b: HeroNode; signal: boolean; delay: number; dur: number }

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildNetwork() {
  const rand = seeded(42)
  const levels = 6
  const width = 1200
  const height = 720
  const nodes: HeroNode[] = []
  const edges: HeroEdge[] = []
  let prev: HeroNode[] = []
  let id = 0

  for (let level = 0; level < levels; level++) {
    const count = 2 ** level
    const spread = height * Math.min(0.92, 0.18 + level * 0.16)
    const current: HeroNode[] = []
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1)
      const node: HeroNode = {
        id: id++,
        level,
        x: 90 + level * ((width - 160) / (levels - 1)) + (rand() - 0.5) * 50,
        y: height / 2 + (t - 0.5) * spread + (level ? (rand() - 0.5) * (spread / count) * 0.8 : 0),
      }
      current.push(node)
    }
    current.forEach((node, i) => {
      const parent = prev[Math.floor(i / 2)]
      if (parent) {
        edges.push({ a: parent, b: node, signal: rand() > 0.35, delay: rand() * 6, dur: 3 + rand() * 4 })
      }
      const sibling = current[i + 1]
      if (sibling && level > 2 && rand() > 0.7) {
        edges.push({ a: node, b: sibling, signal: false, delay: 0, dur: 0 })
      }
    })
    nodes.push(...current)
    prev = current
  }
  return { nodes, edges, width, height }
}

const NETWORK = buildNetwork()

export function HeroNetwork() {
  const { nodes, edges, width, height } = NETWORK
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="origin-glow">
          <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {edges.map((e, i) => (
        <line
          key={`l-${i}`}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          className="stroke-foreground/20"
          strokeWidth={1}
        />
      ))}

      {edges
        .filter((e) => e.signal)
        .map((e, i) => (
          <line
            key={`s-${i}`}
            x1={e.a.x}
            y1={e.a.y}
            x2={e.b.x}
            y2={e.b.y}
            pathLength={400}
            className={`signal-travel ${e.b.level > 3 ? 'stroke-signal' : 'stroke-ember'}`}
            strokeWidth={3}
            strokeLinecap="round"
            style={{ ['--delay' as string]: `${e.delay}s`, ['--dur' as string]: `${e.dur}s` }}
          />
        ))}

      <circle cx={nodes[0].x} cy={nodes[0].y} r={70} fill="url(#origin-glow)" />

      {nodes.map((n) => (
        <circle
          key={n.id}
          cx={n.x}
          cy={n.y}
          r={n.level === 0 ? 5 : Math.max(1.6, 4 - n.level * 0.45)}
          className={`twinkle ${n.level === 0 ? 'fill-ember' : n.level > 3 ? 'fill-signal' : 'fill-foreground/70'}`}
          style={{ ['--delay' as string]: `${(n.id * 0.37) % 4}s`, ['--dur' as string]: `${3 + (n.id % 5)}s` }}
        />
      ))}
    </svg>
  )
}
