import { useState, useMemo } from 'react'
import { useGameStore } from '../../store/gameStore'
import { getNextElection } from '../../game/selectors'
import { formatNumber, formatCash } from '../../game/persistence'

interface AdOption {
  id: string
  label: string
  emoji: string
  pitch: string
  // Returns values computed from the snapshot
  cashCost: (req: number) => number
  supporterGain: (req: number) => number
  cashGain: (req: number) => number
  supporterPenalty: (supporters: number) => number  // subtracted, not added to totalEarned
  positiveDesc: (req: number) => string
  negativeDesc: (req: number, supporters: number) => string
}

const OPTIONS: AdOption[] = [
  {
    id: 'positive',
    label: 'Positive Spotlight',
    emoji: '😊',
    pitch: 'Highlight your record and vision. Safe messaging, broad appeal.',
    cashCost: (req) => Math.floor(req * 0.05),
    supporterGain: (req) => Math.floor(req * 0.12),
    cashGain: (req) => Math.floor(req * 0.04),
    supporterPenalty: () => 0,
    positiveDesc: (req) => `+${formatNumber(Math.floor(req * 0.12))} supporters, +${formatCash(Math.floor(req * 0.04))} donor influx`,
    negativeDesc: (req) => `Costs ${formatCash(Math.floor(req * 0.05))} to air. No other downside.`,
  },
  {
    id: 'contrast',
    label: 'Contrast Campaign',
    emoji: '⚖️',
    pitch: 'Compare records side by side. Higher spend, stronger message.',
    cashCost: (req) => Math.floor(req * 0.15),
    supporterGain: (req) => Math.floor(req * 0.28),
    cashGain: () => 0,
    supporterPenalty: () => 0,
    positiveDesc: (req) => `+${formatNumber(Math.floor(req * 0.28))} supporters`,
    negativeDesc: (req) => `Costs ${formatCash(Math.floor(req * 0.15))} — opposition buys counter-ads.`,
  },
  {
    id: 'attack',
    label: 'Opposition Hit',
    emoji: '🔥',
    pitch: 'Go straight for your opponent\'s record. Maximum reach, maximum risk.',
    cashCost: (req) => Math.floor(req * 0.30),
    supporterGain: (req) => Math.floor(req * 0.50),
    cashGain: () => 0,
    supporterPenalty: (supporters) => Math.floor(supporters * 0.15),
    positiveDesc: (req) => `+${formatNumber(Math.floor(req * 0.50))} supporters`,
    negativeDesc: (req, supporters) =>
      `Costs ${formatCash(Math.floor(req * 0.30))} AND alienates moderates — you lose ${formatNumber(Math.floor(supporters * 0.15))} of your current supporters.`,
  },
]

interface Snapshot { supporters: number; cash: number; required: number }

interface Props { onClose: () => void; onCancel: () => void }

export function TvAdMinigame({ onClose, onCancel }: Props) {
  const state = useGameStore((s) => s)
  const completeMinigame = useGameStore((s) => s.completeMinigame)

  const snap = useMemo<Snapshot>(
    () => ({
      supporters: state.supporters,
      cash: state.cash,
      required: getNextElection(state)?.supportersRequired ?? 500,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [chosen, setChosen] = useState<AdOption | null>(null)

  function handleChoose(opt: AdOption) {
    const cost = opt.cashCost(snap.required)
    if (snap.cash < cost) return  // can't afford
    const gain = opt.supporterGain(snap.required)
    const cashBonus = opt.cashGain(snap.required)
    const penalty = opt.supporterPenalty(snap.supporters)
    // Deduct cost, apply cash bonus
    useGameStore.setState((s) => ({ cash: Math.max(0, s.cash - cost + cashBonus) }))
    // Apply supporter penalty (without affecting totalSupportersEarned)
    if (penalty > 0) {
      useGameStore.setState((s) => ({ supporters: Math.max(0, s.supporters - penalty) }))
    }
    setChosen(opt)
    completeMinigame('tv_ad', gain)
  }

  if (chosen) {
    const cost = chosen.cashCost(snap.required)
    const gain = chosen.supporterGain(snap.required)
    const cashBonus = chosen.cashGain(snap.required)
    const penalty = chosen.supporterPenalty(snap.supporters)
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div className="text-4xl">{chosen.emoji}</div>
          <h2 className="text-xl font-bold">Ad aired — results are in.</h2>
          <div className="space-y-2 text-sm">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="text-lg font-bold text-red-700">−{formatCash(cost)}</div>
              <div className="text-xs text-red-600">airtime cost</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-700">+{formatNumber(gain)}</div>
              <div className="text-xs text-green-600">new supporters</div>
            </div>
            {cashBonus > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-lg font-bold text-green-700">+{formatCash(cashBonus)}</div>
                <div className="text-xs text-green-600">donor influx</div>
              </div>
            )}
            {penalty > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="text-lg font-bold text-red-700">−{formatNumber(penalty)}</div>
                <div className="text-xs text-red-600">moderates walked</div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90dvh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">📺</div>
            <h2 className="text-xl font-bold">TV Ad Spot</h2>
            <p className="text-sm text-gray-500">You have a prime-time slot. Choose your message.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">✕</button>
        </div>
        <div className="space-y-3">
          {OPTIONS.map((opt) => {
            const cost = opt.cashCost(snap.required)
            const canAfford = snap.cash >= cost
            return (
              <button
                key={opt.id}
                onClick={() => handleChoose(opt)}
                disabled={!canAfford}
                className={`w-full p-3 border-2 rounded-xl text-left transition-colors
                  ${canAfford
                    ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${canAfford ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                    {formatCash(cost)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{opt.pitch}</div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-green-700">✓ {opt.positiveDesc(snap.required)}</div>
                  <div className="text-xs text-red-600">✗ {opt.negativeDesc(snap.required, snap.supporters)}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
