import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { useGameStore } from './store/gameStore'
import { TICK_RATE_MS } from './game/constants'

export default function App() {
  useEffect(() => {
    let rafId: number
    let lastTime = performance.now()

    function loop(time: number) {
      if (time - lastTime >= TICK_RATE_MS) {
        lastTime = time
        try {
          useGameStore.getState().tick()
        } catch (e) {
          console.error('Game loop error:', e)
        }
      }
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return <Layout />
}
