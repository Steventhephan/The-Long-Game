import { useEffect, useState } from 'react'
import { Layout } from './components/layout/Layout'
import { useGameStore } from './store/gameStore'
import { TICK_RATE_MS } from './game/constants'

function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 bg-blue-950 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6">
        <div className="text-5xl">🗳️</div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          Who is prepared to trek<br />
          <span className="text-blue-700">The Long Game?</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            maxLength={20}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
            className="w-full border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-center text-lg font-semibold outline-none transition-colors"
          />
          <div className="text-xs text-gray-400">{value.length}/20 characters</div>
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full py-3 bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold rounded-xl text-lg transition-colors"
          >
            Begin Campaign
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const playerName = useGameStore((s) => s.playerName)
  const startNewGame = useGameStore((s) => s.startNewGame)

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

  if (!playerName) {
    return <NamePrompt onSubmit={startNewGame} />
  }

  return <Layout />
}
