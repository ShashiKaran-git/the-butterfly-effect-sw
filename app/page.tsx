import { Hero } from '@/components/experiment/hero'
import { Experiment } from '@/components/experiment/experiment'
import { About } from '@/components/experiment/about'

export default function Page() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Hero />
      <main>
        <Experiment />
        <About />
      </main>
    </>
  )
}
