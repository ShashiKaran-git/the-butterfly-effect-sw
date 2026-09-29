'use client'

import { useState } from 'react'
import { CHOICES, INITIAL_STAGE, type Choice, type Fork, type Stage } from '@/lib/simulation'
import { Simulation } from './simulation'
import { ConsequenceChain } from './consequence-chain'
import { Revelation } from './revelation'

export type Run = {
  choice: Choice | null
  fork: Fork | null
  step: 0 | 1 | 2 | 3
}

const EMPTY_RUN: Run = { choice: null, fork: null, step: 0 }

export function pathFor(run: Run): Stage[] {
  const path: Stage[] = [INITIAL_STAGE]
  if (run.choice) path.push(run.choice.stage)
  if (run.fork) path.push(run.fork.stages[0])
  if (run.fork && run.step === 3) path.push(run.fork.stages[1])
  return path
}

export function Experiment() {
  const [run, setRun] = useState<Run>(EMPTY_RUN)
  const [runCount, setRunCount] = useState(1)

  const choose = (id: Choice['id']) => {
    const choice = CHOICES.find((c) => c.id === id) ?? null
    setRun({ choice, fork: null, step: 1 })
  }
  const pickFork = (fork: Fork) => setRun((r) => ({ ...r, fork, step: 2 }))
  const advance = () => setRun((r) => ({ ...r, step: 3 }))
  const restart = () => {
    setRun(EMPTY_RUN)
    setRunCount((n) => n + 1)
    document.getElementById('simulation')?.scrollIntoView({ block: 'start' })
  }

  const path = pathFor(run)
  const complete = run.step === 3

  return (
    <>
      <Simulation
        run={run}
        path={path}
        runCount={runCount}
        onChoose={choose}
        onFork={pickFork}
        onAdvance={advance}
        onRestart={restart}
      />
      <ConsequenceChain run={run} path={path} />
      {complete && <Revelation key={runCount} onRestart={restart} />}
    </>
  )
}
