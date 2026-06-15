import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { UPGRADES } from '../../game/upgrades'

interface ToastItem { id: string; title: string; subtitle: string; emoji: string }

// Watches for first-time unlocks across buildings, upgrades, and minigames.
// Shows a dismissable toast for each new item.
export function UnlockToast() {
  const state = useGameStore((s) => s)
  const totalSupportersEarned = useGameStore((s) => s.totalSupportersEarned)
  const buildings = useGameStore((s) => s.buildings)
  const minigames = useGameStore((s) => s.minigames)

  const seen = useRef<Set<string>>(new Set())
  const [queue, setQueue] = useState<ToastItem[]>([])
  const [current, setCurrent] = useState<ToastItem | null>(null)

  // Advance queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]!)
      setQueue((q) => q.slice(1))
    }
  }, [current, queue])

  // Auto-dismiss after 3.5s
  useEffect(() => {
    if (!current) return
    const t = setTimeout(() => setCurrent(null), 3500)
    return () => clearTimeout(t)
  }, [current])

  function enqueue(items: ToastItem[]) {
    if (items.length === 0) return
    setQueue((q) => [...q, ...items])
  }

  // Check buildings
  useEffect(() => {
    const newItems: ToastItem[] = []
    for (const b of Object.values(buildings)) {
      const key = `building:${b.id}`
      if (!seen.current.has(key) && totalSupportersEarned >= b.unlockAt) {
        seen.current.add(key)
        // Don't notify volunteer since it's available from the start
        if (b.id !== 'volunteer' && b.unlockAt > 0) {
          newItems.push({ id: key, emoji: '🙋', title: `New staff: ${b.name}`, subtitle: b.description })
        }
      }
    }
    enqueue(newItems)
  }, [totalSupportersEarned, buildings])

  // Check upgrades
  useEffect(() => {
    const newItems: ToastItem[] = []
    for (const [id, def] of Object.entries(UPGRADES)) {
      const key = `upgrade:${id}`
      if (!seen.current.has(key) && def.unlockCondition(state)) {
        seen.current.add(key)
        newItems.push({ id: key, emoji: '⬆️', title: `New upgrade: ${def.name}`, subtitle: def.description })
      }
    }
    enqueue(newItems)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.totalSupportersEarned, state.totalCashEarned, state.buildings, state.elections])

  // Check minigames
  useEffect(() => {
    const newItems: ToastItem[] = []
    const LABELS: Record<string, string> = {
      tv_ad: 'TV Ad',
      debate: 'Debate',
      stump_speech: 'Stump Speech',
      fundraiser: 'Fundraiser',
    }
    for (const [id, mg] of Object.entries(minigames)) {
      const key = `minigame:${id}`
      if (!seen.current.has(key) && mg.unlocked) {
        seen.current.add(key)
        newItems.push({ id: key, emoji: '📢', title: `New outreach: ${LABELS[id] ?? id}`, subtitle: 'Available in the Outreach tab.' })
      }
    }
    enqueue(newItems)
  }, [minigames])

  if (!current) return null

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-in-up"
      style={{ maxWidth: 'calc(100vw - 2rem)', width: '22rem' }}
    >
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{current.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{current.title}</div>
          <div className="text-xs text-gray-300 mt-0.5 line-clamp-2">{current.subtitle}</div>
        </div>
        <button onClick={() => setCurrent(null)} className="text-gray-400 hover:text-white text-lg leading-none flex-shrink-0">
          ×
        </button>
      </div>
    </div>
  )
}
