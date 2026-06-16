import { useState, useMemo } from 'react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber, formatCash } from '../../game/persistence'

// Fundraiser: choose a donor strategy. Each has a clear cash gain and a supporter/volunteer tradeoff.
// Numbers are frozen from a snapshot at open time.

interface Snapshot { supporters: number; cash: number; volunteers: number }

interface DonorStrategy {
  id: string
  name: string
  emoji: string
  pitch: string
  positive: string
  negative: string
  cashGain: (s: Snapshot) => number
  supporterDelta: (s: Snapshot) => number  // can be negative
  volunteerDelta?: number
}

const STRATEGIES: DonorStrategy[] = [
  {
    id: 'grassroots',
    name: 'Grassroots Drive',
    emoji: '🌱',
    pitch: 'Small-dollar fundraising from your base. Lots of asks, lots of goodwill.',
    positive: 'Reliable cash from many small donors. Energizes volunteers.',
    negative: 'Modest haul — this isn\'t whale money.',
    cashGain: (s) => s.cash * 0.18,
    supporterDelta: () => 0,
    volunteerDelta: 4,
  },
  {
    id: 'corporate_pac',
    name: 'Corporate PAC',
    emoji: '🏢',
    pitch: 'Accept bundled donations from a business coalition.',
    positive: 'Large cash infusion — the biggest dollar amount of any option.',
    negative: 'Grassroots supporters notice. Some disengage and walk.',
    cashGain: (s) => s.cash * 0.45,
    supporterDelta: (s) => -Math.floor(s.supporters * 0.06),
    volunteerDelta: -2,
  },
  {
    id: 'celebrity_gala',
    name: 'Celebrity Gala',
    emoji: '✨',
    pitch: 'High-profile gala with celebrity co-hosts. Glamour and dollars.',
    positive: 'Strong cash and a surge of star-struck new supporters.',
    negative: 'Volunteers think it\'s performative. A few quietly resign.',
    cashGain: (s) => s.cash * 0.28,
    supporterDelta: (s) => Math.floor(s.supporters * 0.1),
    volunteerDelta: -3,
  },
  {
    id: 'policy_summit',
    name: 'Policy Summit',
    emoji: '📋',
    pitch: 'Host wonks, academics, and think-tanks. Credibility over flash.',
    positive: 'Moderate cash. Volunteers love the substance — recruitment spikes.',
    negative: 'Donor dollars are modest; issue-focused donors give less than PACs.',
    cashGain: (s) => s.cash * 0.14,
    supporterDelta: (s) => Math.floor(s.supporters * 0.05),
    volunteerDelta: 7,
  },
]

interface Props { onClose: () => void; onCancel?: () => void }

export function FundraiserMinigame({ onClose, onCancel }: Props) {
  const storeSupport = useGameStore((s) => s.supporters)
  const storeCash = useGameStore((s) => s.cash)
  const storeVol = useGameStore((s) => s.buildings.volunteer.count)
  const completeMinigame = useGameStore((s) => s.completeMinigame)

  const snap = useMemo<Snapshot>(
    () => ({ supporters: storeSupport, cash: storeCash, volunteers: storeVol }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const activeStrategies = useMemo(
    () => [...STRATEGIES].sort(() => Math.random() - 0.5).slice(0, 3),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [chosen, setChosen] = useState<DonorStrategy | null>(null)

  function handleChoose(s: DonorStrategy) {
    const cashGain = s.cashGain(snap)
    const supporterDelta = s.supporterDelta(snap)
    const volDelta = s.volunteerDelta ?? 0

    useGameStore.setState((st) => ({
      cash: st.cash + cashGain,
      supporters: Math.max(0, st.supporters + supporterDelta),
      totalSupportersEarned: supporterDelta > 0
        ? st.totalSupportersEarned + supporterDelta
        : st.totalSupportersEarned,
      buildings: volDelta !== 0 ? {
        ...st.buildings,
        volunteer: { ...st.buildings.volunteer, count: Math.max(0, st.buildings.volunteer.count + volDelta) },
      } : st.buildings,
    }))
    setChosen(s)
    completeMinigame('fundraiser', 0)  // supporter bonus applied above; pass 0 to avoid double-add
  }

  if (chosen) {
    const cashGain = chosen.cashGain(snap)
    const sDelta = chosen.supporterDelta(snap)
    const vDelta = chosen.volunteerDelta ?? 0
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div className="text-4xl">{chosen.emoji}</div>
          <h2 className="text-xl font-bold">Fundraiser wrapped.</h2>
          <div className="space-y-2 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-700">+{formatCash(cashGain)}</div>
              <div className="text-xs text-green-600">raised</div>
            </div>
            {sDelta !== 0 && (
              <div className={`border rounded-xl p-3 ${sDelta > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-lg font-bold ${sDelta > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {sDelta > 0 ? '+' : ''}{formatNumber(sDelta)} supporters
                </div>
                <div className={`text-xs ${sDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sDelta > 0 ? 'new faces energized' : 'supporters disengaged'}
                </div>
              </div>
            )}
            {vDelta !== 0 && (
              <div className={`border rounded-xl p-3 ${vDelta > 0 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-lg font-bold ${vDelta > 0 ? 'text-orange-700' : 'text-red-700'}`}>
                  {vDelta > 0 ? '+' : ''}{vDelta} volunteers
                </div>
                <div className={`text-xs ${vDelta > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {vDelta > 0 ? 'signed up' : 'stepped back'}
                </div>
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
            <div className="text-3xl mb-1">💰</div>
            <h2 className="text-xl font-bold">Fundraiser</h2>
            <p className="text-sm text-gray-500">Choose your donor strategy. Every approach has a price.</p>
          </div>
          {onCancel && <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">✕</button>}
        </div>
        <div className="space-y-3">
          {activeStrategies.map((strat) => {
            const cashGain = strat.cashGain(snap)
            const sDelta = strat.supporterDelta(snap)
            const vDelta = strat.volunteerDelta ?? 0
            return (
              <button
                key={strat.id}
                onClick={() => handleChoose(strat)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>{strat.emoji}</span>
                  <span>{strat.name}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{strat.pitch}</div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-green-700">
                    ✓ {strat.positive}
                    <span className="ml-1 font-semibold">
                      (+{formatCash(cashGain)}{sDelta > 0 ? `, +${formatNumber(sDelta)} supporters` : ''}{vDelta > 0 ? `, +${vDelta} volunteers` : ''})
                    </span>
                  </div>
                  <div className="text-xs text-red-600">
                    ✗ {strat.negative}
                    {(sDelta < 0 || vDelta < 0) && (
                      <span className="ml-1 font-semibold">
                        ({[sDelta < 0 ? `${formatNumber(sDelta)} supporters` : '', vDelta < 0 ? `${vDelta} volunteers` : ''].filter(Boolean).join(', ')})
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
