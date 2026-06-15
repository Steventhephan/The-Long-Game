import { useState, useMemo } from 'react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber, formatCash } from '../../game/persistence'

// Topic-based strategy choice — no timer, no tapping.
// Each topic has a KNOWN, STATED trade-off before the player commits.
// Numbers are frozen from a snapshot at open time.

interface Snapshot { supporters: number; cash: number }

interface Topic {
  id: string
  name: string
  emoji: string
  pitch: string
  positive: string
  negative: string
  supporterGain: (s: Snapshot) => number
  cashDelta: (s: Snapshot) => number  // positive = gain, negative = lose
  volunteerDelta?: number
}

const TOPICS: Topic[] = [
  {
    id: 'working_families',
    name: 'Working Families',
    emoji: '👨‍👩‍👦',
    pitch: 'Kitchen-table issues: wages, childcare, cost of living.',
    positive: 'Resonates broadly. Your largest supporter surge of the four options.',
    negative: 'Business donors hold their checkbooks. You lose cash.',
    supporterGain: (s) => Math.floor(s.supporters * 0.22),
    cashDelta: (s) => -(s.cash * 0.12),
  },
  {
    id: 'economic_growth',
    name: 'Economic Growth',
    emoji: '📈',
    pitch: 'Pro-business, investment-friendly message. Market wins, jobs follow.',
    positive: 'Corporate and small-business donors respond with contributions.',
    negative: 'Working-class voters feel like it\'s not for them. Modest supporter gain only.',
    supporterGain: (s) => Math.floor(s.supporters * 0.07),
    cashDelta: (s) => s.cash * 0.25,
  },
  {
    id: 'healthcare',
    name: 'Universal Healthcare',
    emoji: '🏥',
    pitch: 'Healthcare as a right, not a privilege. Bold, morally clear.',
    positive: 'Strong grassroots surge. Volunteer recruitment spikes.',
    negative: 'Insurance and pharmaceutical donors pull back.',
    supporterGain: (s) => Math.floor(s.supporters * 0.14),
    cashDelta: (s) => -(s.cash * 0.08),
    volunteerDelta: 5,
  },
  {
    id: 'law_order',
    name: 'Law & Order',
    emoji: '👮',
    pitch: 'Community safety, accountability, and tough-on-crime credibility.',
    positive: 'Wins over moderates and independents. PAC money flows in.',
    negative: 'Progressive supporters disengage. Some volunteers quietly leave.',
    supporterGain: (s) => Math.floor(s.supporters * 0.16),
    cashDelta: (s) => s.cash * 0.12,
    volunteerDelta: -3,
  },
]

interface Props { onClose: () => void; onCancel: () => void }

export function StumpSpeechMinigame({ onClose, onCancel }: Props) {
  const storeSupport = useGameStore((s) => s.supporters)
  const storeCash = useGameStore((s) => s.cash)
  const completeMinigame = useGameStore((s) => s.completeMinigame)

  const snap = useMemo<Snapshot>(
    () => ({ supporters: storeSupport, cash: storeCash }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [chosen, setChosen] = useState<Topic | null>(null)

  function handleChoose(topic: Topic) {
    const supporterBonus = topic.supporterGain(snap)
    const cashDelta = topic.cashDelta(snap)
    const volDelta = topic.volunteerDelta ?? 0

    useGameStore.setState((s) => ({
      cash: Math.max(0, s.cash + cashDelta),
      buildings: volDelta !== 0 ? {
        ...s.buildings,
        volunteer: { ...s.buildings.volunteer, count: Math.max(0, s.buildings.volunteer.count + volDelta) },
      } : s.buildings,
    }))
    setChosen(topic)
    completeMinigame('stump_speech', supporterBonus)
  }

  if (chosen) {
    const sGain = chosen.supporterGain(snap)
    const cDelta = chosen.cashDelta(snap)
    const vDelta = chosen.volunteerDelta ?? 0
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div className="text-4xl">{chosen.emoji}</div>
          <h2 className="text-xl font-bold">Speech delivered.</h2>
          <div className="space-y-2 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-700">+{formatNumber(sGain)}</div>
              <div className="text-xs text-green-600">new supporters</div>
            </div>
            {cDelta !== 0 && (
              <div className={`border rounded-xl p-3 ${cDelta > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-lg font-bold ${cDelta > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {cDelta > 0 ? '+' : ''}{formatCash(cDelta)}
                </div>
                <div className={`text-xs ${cDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cDelta > 0 ? 'donor influx' : 'donor pullback'}
                </div>
              </div>
            )}
            {vDelta !== 0 && (
              <div className={`border rounded-xl p-3 ${vDelta > 0 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-lg font-bold ${vDelta > 0 ? 'text-orange-700' : 'text-red-700'}`}>
                  {vDelta > 0 ? '+' : ''}{vDelta} volunteers
                </div>
                <div className={`text-xs ${vDelta > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {vDelta > 0 ? 'energized grassroots' : 'some volunteers step back'}
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
            <div className="text-3xl mb-1">🎤</div>
            <h2 className="text-xl font-bold">Stump Speech</h2>
            <p className="text-sm text-gray-500">Choose today's message. Every choice wins some and costs with others.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">✕</button>
        </div>
        <div className="space-y-3">
          {TOPICS.map((topic) => {
            const sGain = topic.supporterGain(snap)
            const cDelta = topic.cashDelta(snap)
            const vDelta = topic.volunteerDelta ?? 0
            return (
              <button
                key={topic.id}
                onClick={() => handleChoose(topic)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>{topic.emoji}</span>
                  <span>{topic.name}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{topic.pitch}</div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-green-700">
                    ✓ {topic.positive}
                    <span className="ml-1 font-semibold">(+{formatNumber(sGain)} supporters{cDelta > 0 ? `, +${formatCash(cDelta)}` : ''}{vDelta > 0 ? `, +${vDelta} volunteers` : ''})</span>
                  </div>
                  <div className="text-xs text-red-600">
                    ✗ {topic.negative}
                    {(cDelta < 0 || vDelta < 0) && (
                      <span className="ml-1 font-semibold">
                        ({[cDelta < 0 ? formatCash(cDelta) + ' cash' : '', vDelta < 0 ? `${vDelta} volunteers` : ''].filter(Boolean).join(', ')})
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
