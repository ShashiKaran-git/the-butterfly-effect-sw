export type NodeId =
  | 'power'
  | 'hospital'
  | 'comms'
  | 'water'
  | 'traffic'
  | 'data'
  | 'transit'
  | 'districts'

export type Status = 'active' | 'recovered' | 'affected' | 'offline'

export type Edge = readonly [NodeId, NodeId]

export type WorldState = Record<NodeId, Status>

export type Stage = {
  clock: string
  title: string
  body: string
  states: WorldState
  flows: Edge[]
  strains: Edge[]
}

export type Outcome = {
  title: string
  summary: string
}

export type Fork = {
  id: string
  label: string
  detail: string
  stages: [Stage, Stage]
  outcome: Outcome
}

export type Choice = {
  id: 'power' | 'hospital' | 'comms'
  label: string
  detail: string
  stage: Stage
  forkPrompt: string
  forks: [Fork, Fork]
}

export const NODES: { id: NodeId; label: string; short: string }[] = [
  { id: 'power', label: 'Power Grid', short: 'Grid' },
  { id: 'hospital', label: 'Hospital Network', short: 'Hospital' },
  { id: 'comms', label: 'Emergency Comms', short: 'Comms' },
  { id: 'water', label: 'Water Pumps', short: 'Water' },
  { id: 'traffic', label: 'Traffic Control', short: 'Traffic' },
  { id: 'data', label: 'Data Center', short: 'Data' },
  { id: 'transit', label: 'Transit Line', short: 'Transit' },
  { id: 'districts', label: 'Residential Districts', short: 'Districts' },
]

export const NODE_LABEL = Object.fromEntries(NODES.map((n) => [n.id, n.label])) as Record<
  NodeId,
  string
>

export const EDGES: Edge[] = [
  ['power', 'hospital'],
  ['power', 'water'],
  ['power', 'traffic'],
  ['power', 'data'],
  ['hospital', 'comms'],
  ['hospital', 'water'],
  ['hospital', 'districts'],
  ['comms', 'data'],
  ['comms', 'transit'],
  ['traffic', 'districts'],
  ['water', 'districts'],
  ['data', 'districts'],
  ['transit', 'districts'],
]

export const STATUS_LABEL: Record<Status, string> = {
  active: 'Intervening',
  recovered: 'Recovered',
  affected: 'Affected',
  offline: 'Offline',
}

export const edgeKey = ([a, b]: Edge) => [a, b].sort().join(':')

const INITIAL_STATES: WorldState = {
  power: 'affected',
  hospital: 'affected',
  comms: 'offline',
  water: 'affected',
  traffic: 'offline',
  data: 'affected',
  transit: 'offline',
  districts: 'affected',
}

const with_ = (base: WorldState, changes: Partial<WorldState>): WorldState => ({
  ...base,
  ...changes,
})

export const INITIAL_STAGE: Stage = {
  clock: 'T-03:00',
  title: 'Meridian is failing.',
  body: "A cascading failure is moving through the fictional city of Meridian. Backup systems will hold for three more minutes. You have the crews and access to act on one system first. Everything else will have to wait — and react.",
  states: INITIAL_STATES,
  flows: [],
  strains: [
    ['power', 'hospital'],
    ['power', 'water'],
    ['power', 'data'],
    ['hospital', 'districts'],
    ['comms', 'transit'],
    ['water', 'districts'],
  ],
}

const POWER_S1 = with_(INITIAL_STATES, {
  power: 'active',
  water: 'recovered',
  traffic: 'recovered',
  data: 'recovered',
})

const HOSPITAL_S1 = with_(INITIAL_STATES, { hospital: 'active', water: 'offline' })

const COMMS_S1 = with_(INITIAL_STATES, { comms: 'active', data: 'recovered', transit: 'affected' })

export const CHOICES: Choice[] = [
  {
    id: 'power',
    label: "Restore the city's power grid",
    detail: 'Bring the source back. Everything downstream depends on it.',
    stage: {
      clock: 'T-02:00',
      title: 'The lights come back.',
      body: "Substations reconnect one by one. Water pressure returns and traffic signals reset. But the restored grid is unstable, and the hospital's generators were never built to hand off to a surge this uneven.",
      states: POWER_S1,
      flows: [
        ['power', 'water'],
        ['power', 'traffic'],
        ['power', 'data'],
      ],
      strains: [
        ['power', 'hospital'],
        ['hospital', 'districts'],
      ],
    },
    forkPrompt: 'The grid is carrying more load than it can hold. What do you shed?',
    forks: [
      {
        id: 'shed-districts',
        label: 'Shed the residential districts',
        detail: 'Darken homes to keep the core stable.',
        stages: [
          {
            clock: 'T-01:00',
            title: 'Homes go dark so the core can stay lit.',
            body: 'The load drops. The hospital syncs to grid power cleanly. Across the districts, people step outside to see why everything went quiet.',
            states: with_(POWER_S1, { districts: 'offline', hospital: 'recovered' }),
            flows: [
              ['power', 'hospital'],
              ['power', 'data'],
            ],
            strains: [['water', 'districts']],
          },
          {
            clock: 'T-00:00',
            title: 'A stable core, a dark perimeter.',
            body: "With the data center running, dispatch software restarts and emergency channels quietly come back. The districts stay dark, but nothing critical falls.",
            states: with_(POWER_S1, {
              power: 'recovered',
              districts: 'offline',
              hospital: 'recovered',
              comms: 'recovered',
            }),
            flows: [
              ['power', 'hospital'],
              ['comms', 'data'],
              ['hospital', 'comms'],
            ],
            strains: [['transit', 'districts']],
          },
        ],
        outcome: {
          title: 'The Quiet Core',
          summary:
            'Every essential service held. The price was paid by the people in the residential districts, who spent the night in darkness so the center could stay lit.',
        },
      },
      {
        id: 'shed-traffic',
        label: 'Shed the traffic network',
        detail: 'Keep homes powered. Let the intersections go.',
        stages: [
          {
            clock: 'T-01:00',
            title: 'The signals go dark.',
            body: 'Homes keep their power. Every intersection becomes an improvised negotiation. Ambulances begin taking longer, winding routes.',
            states: with_(POWER_S1, { traffic: 'offline', districts: 'recovered' }),
            flows: [
              ['power', 'water'],
              ['water', 'districts'],
              ['data', 'districts'],
            ],
            strains: [
              ['traffic', 'districts'],
              ['hospital', 'districts'],
            ],
          },
          {
            clock: 'T-00:00',
            title: 'A bright city, a slow response.',
            body: "The hospital's generators hold, barely. Patients arrive, but later than they should. Comms stay down, so no one can reroute the ambulances.",
            states: with_(POWER_S1, {
              power: 'recovered',
              traffic: 'offline',
              districts: 'recovered',
              hospital: 'affected',
            }),
            flows: [
              ['power', 'water'],
              ['water', 'districts'],
            ],
            strains: [
              ['traffic', 'districts'],
              ['power', 'hospital'],
              ['comms', 'transit'],
            ],
          },
        ],
        outcome: {
          title: 'The Lit City',
          summary:
            'Homes stayed warm and bright. But with traffic control gone and no way to coordinate, help moved slowly through the streets it had just lit.',
        },
      },
    ],
  },
  {
    id: 'hospital',
    label: 'Protect the hospital network',
    detail: 'Guard the people who are most fragile right now.',
    stage: {
      clock: 'T-02:00',
      title: 'The wards stay lit.',
      body: "Crews isolate the hospital onto its own microgrid. Surgery continues without interruption. Outside its walls, the failure keeps spreading — the water pumps lose pressure entirely.",
      states: HOSPITAL_S1,
      flows: [['hospital', 'comms']],
      strains: [
        ['power', 'water'],
        ['water', 'districts'],
        ['power', 'data'],
      ],
    },
    forkPrompt: 'People are arriving at the hospital on foot. Where does its spare capacity go?',
    forks: [
      {
        id: 'open-doors',
        label: 'Open the doors to the districts',
        detail: 'Turn the hospital into a shelter.',
        stages: [
          {
            clock: 'T-01:00',
            title: 'The hospital becomes a shelter.',
            body: 'Its lobby fills with residents who have nowhere else with light and heat. For the first time tonight, people feel safe. The staff feel the weight.',
            states: with_(HOSPITAL_S1, { districts: 'recovered' }),
            flows: [['hospital', 'districts']],
            strains: [
              ['power', 'water'],
              ['power', 'hospital'],
            ],
          },
          {
            clock: 'T-00:00',
            title: 'A lighthouse under strain.',
            body: 'The microgrid runs hot. Care continues, but every reserve is spoken for. The grid itself stays down until morning.',
            states: with_(HOSPITAL_S1, {
              hospital: 'affected',
              districts: 'recovered',
              power: 'offline',
            }),
            flows: [['hospital', 'districts']],
            strains: [
              ['power', 'hospital'],
              ['power', 'data'],
              ['hospital', 'water'],
            ],
          },
        ],
        outcome: {
          title: 'The Lighthouse',
          summary:
            "The hospital became the city's heart for the night, and nearly buckled under that weight. People found safety. The rest of Meridian waited in the dark.",
        },
      },
      {
        id: 'lend-generators',
        label: 'Lend generators to the water pumps',
        detail: "Trade part of the hospital's safety margin.",
        stages: [
          {
            clock: 'T-01:00',
            title: 'Two generators roll out.',
            body: "They reach the pump station and water pressure returns to the eastern districts. The hospital's reserve margin shrinks to almost nothing.",
            states: with_(HOSPITAL_S1, { water: 'recovered', hospital: 'affected' }),
            flows: [['hospital', 'water']],
            strains: [['power', 'hospital']],
          },
          {
            clock: 'T-00:00',
            title: 'The trade holds.',
            body: 'Clean water reaches thousands of homes. The hospital runs thin but steady. It was a risky bet, and this time it paid off.',
            states: with_(HOSPITAL_S1, {
              water: 'recovered',
              hospital: 'recovered',
              districts: 'recovered',
            }),
            flows: [
              ['hospital', 'water'],
              ['water', 'districts'],
            ],
            strains: [
              ['power', 'data'],
              ['power', 'traffic'],
            ],
          },
        ],
        outcome: {
          title: 'The Shared Reserve',
          summary:
            'By giving up part of its own safety, the hospital kept water flowing to the city. A narrow, fragile success, and one that might have gone the other way.',
        },
      },
    ],
  },
  {
    id: 'comms',
    label: 'Restore emergency communications',
    detail: 'Fix nothing directly. Help everyone see.',
    stage: {
      clock: 'T-02:00',
      title: 'The city can speak again.',
      body: "Emergency channels come back online. For the first time, dispatchers can see where the failure is spreading. But seeing a problem is not the same as fixing it.",
      states: COMMS_S1,
      flows: [
        ['comms', 'data'],
        ['comms', 'transit'],
        ['hospital', 'comms'],
      ],
      strains: [
        ['power', 'hospital'],
        ['power', 'water'],
      ],
    },
    forkPrompt: 'Reports are flooding in. What do you broadcast first?',
    forks: [
      {
        id: 'volunteers',
        label: 'Coordinate volunteer crews',
        detail: 'Ask the city to help repair itself.',
        stages: [
          {
            clock: 'T-01:00',
            title: 'The call goes out.',
            body: 'Off-duty technicians hear it and organize themselves. Three substations are reset by hand. The grid begins to recover from many places at once.',
            states: with_(COMMS_S1, { power: 'recovered', transit: 'recovered' }),
            flows: [
              ['comms', 'data'],
              ['power', 'data'],
              ['comms', 'transit'],
            ],
            strains: [['power', 'hospital']],
          },
          {
            clock: 'T-00:00',
            title: 'Recovery, from everywhere.',
            body: 'Power reaches the hospital and the pumps. Traffic is still a mess, but people are moving in the same direction now.',
            states: with_(COMMS_S1, {
              comms: 'recovered',
              power: 'recovered',
              transit: 'recovered',
              hospital: 'recovered',
              water: 'recovered',
              traffic: 'affected',
            }),
            flows: [
              ['power', 'hospital'],
              ['power', 'water'],
              ['comms', 'data'],
              ['transit', 'districts'],
            ],
            strains: [['traffic', 'districts']],
          },
        ],
        outcome: {
          title: 'The Networked City',
          summary:
            "Communication didn't fix anything directly. It let hundreds of people fix things at once. Most systems recovered: slowly, unevenly, together.",
        },
      },
      {
        id: 'shelter',
        label: 'Issue a shelter-in-place order',
        detail: 'Keep people safe by keeping them still.',
        stages: [
          {
            clock: 'T-01:00',
            title: 'The streets empty.',
            body: 'Within minutes, fewer people are at risk on the dark roads. But fewer people are out to help. Repair crews move through a silent city.',
            states: with_(COMMS_S1, { districts: 'recovered', transit: 'offline' }),
            flows: [
              ['comms', 'transit'],
              ['data', 'districts'],
            ],
            strains: [
              ['power', 'hospital'],
              ['power', 'water'],
            ],
          },
          {
            clock: 'T-00:00',
            title: 'The city holds its breath.',
            body: 'No one is hurt on the streets. But the grid never gets the hands it needs, and the hospital runs on its last reserves until dawn.',
            states: with_(COMMS_S1, {
              comms: 'recovered',
              districts: 'recovered',
              transit: 'offline',
              power: 'offline',
            }),
            flows: [['data', 'districts']],
            strains: [
              ['power', 'hospital'],
              ['power', 'water'],
              ['power', 'traffic'],
            ],
          },
        ],
        outcome: {
          title: 'The Held Breath',
          summary:
            'Meridian stayed still and safe. The people were protected, and the systems waited until morning for someone to reach them.',
        },
      },
    ],
  },
]

export type Change = { id: NodeId; from: Status; to: Status }

export function diffStates(prev: WorldState, next: WorldState): Change[] {
  return NODES.filter((n) => prev[n.id] !== next[n.id]).map((n) => ({
    id: n.id,
    from: prev[n.id],
    to: next[n.id],
  }))
}
