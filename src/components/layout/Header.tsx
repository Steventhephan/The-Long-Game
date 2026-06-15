import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { ELECTION_ORDER } from '../../game/constants'

export function Header() {
  const elections = useGameStore((s) => s.elections)
  const saveNow = useGameStore((s) => s.saveNow)
  const hardReset = useGameStore((s) => s.hardReset)
  const [confirming, setConfirming] = useState(false)

  const wonCount = ELECTION_ORDER.filter((t) => elections[t].won).length

  function handleHardReset() {
    hardReset()
    setConfirming(false)
  }

  return (
    <>
      <header className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="font-bold text-lg leading-tight">The Long Game</div>
        <div className="flex items-center gap-2">
          {wonCount > 0 && (
            <div className="text-xs text-blue-200">
              🏆 {wonCount} election{wonCount !== 1 ? 's' : ''} won
            </div>
          )}
          <button
            onClick={saveNow}
            className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
          >
            Reset
          </button>
        </div>
      </header>

      {confirming && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center space-y-4">
            <div className="text-3xl">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900">Hard Reset</h2>
            <p className="text-sm text-gray-500">
              This will wipe all progress and start from zero. There is no undo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleHardReset}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl"
              >
                Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
