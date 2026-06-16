import { useState, useMemo } from 'react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../game/persistence'

// Each question has one clearly correct answer, and wrong answers have real consequences.
// Supporters gain/loss is calculated from a snapshot at open — no live updates.

interface Question {
  text: string
  options: { text: string; correct: boolean; consequence: string }[]
  explanation: string
}

const QUESTIONS: Question[] = [
  {
    text: 'Your opponent accuses you of flip-flopping on taxes.',
    options: [
      { text: '"My position has evolved based on new evidence."', correct: true, consequence: 'Voters respect intellectual honesty.' },
      { text: '"I\'ve never changed my position!"', correct: false, consequence: 'Fact-checkers call you out. Trust erodes.' },
      { text: 'Attack their record instead.', correct: false, consequence: 'Deflection noted. Moderates aren\'t impressed.' },
      { text: '"Politics is complicated."', correct: false, consequence: 'Vague non-answer draws groans.' },
    ],
    explanation: 'Acknowledging growth signals integrity.',
  },
  {
    text: 'The moderator asks for your three-point plan on the deficit.',
    options: [
      { text: 'Offer a specific plan: cut waste, grow revenue, reform entitlements.', correct: true, consequence: 'Specifics signal competence and earn respect.' },
      { text: 'Blame the previous administration.', correct: false, consequence: 'Feels like deflection. Undecideds move away.' },
      { text: '"It\'s complicated — I\'d need more data."', correct: false, consequence: 'You sound unprepared. Momentum shifts.' },
      { text: 'Change the subject to jobs.', correct: false, consequence: 'Pivot noticed. Press runs a story about evasion.' },
    ],
    explanation: 'Specific plans beat platitudes in debates.',
  },
  {
    text: 'Your microphone cuts out mid-answer.',
    options: [
      { text: 'Make a light joke and carry on.', correct: true, consequence: 'Grace under pressure plays well to the crowd.' },
      { text: 'Stop and wait in silence.', correct: false, consequence: 'Awkward pause goes viral on social media.' },
      { text: 'Complain to the moderator loudly.', correct: false, consequence: 'You look rattled. Opponent smirks.' },
      { text: 'Keep shouting until the mic works.', correct: false, consequence: 'Clip of you yelling circulates online.' },
    ],
    explanation: 'Calm composure is more presidential than any policy answer.',
  },
  {
    text: 'Your opponent lands a devastating one-liner that draws applause.',
    options: [
      { text: 'Smile and immediately pivot to your strongest issue.', correct: true, consequence: 'You absorb the hit and change the narrative.' },
      { text: 'Look visibly flustered.', correct: false, consequence: 'Body language is the headline. You lose the moment.' },
      { text: 'Interrupt and argue with their line.', correct: false, consequence: 'You prolong their moment. Bad look.' },
      { text: 'Try to match it with a quip — and fail.', correct: false, consequence: 'Forced humor falls flat. Cringe coverage follows.' },
    ],
    explanation: 'Never let your opponent own the room longer than the moment.',
  },
  {
    text: 'You\'re asked about a gaffe you made last week.',
    options: [
      { text: 'Acknowledge it briefly, clarify, then pivot forward.', correct: true, consequence: 'Ownership defuses the attack. Voters move on.' },
      { text: 'Deny it happened entirely.', correct: false, consequence: 'The tape exists. Clips resurface. Trust damaged.' },
      { text: 'Blame your staff.', correct: false, consequence: 'You look weak and disloyal. Volunteers unhappy.' },
      { text: 'Attack the media for asking.', correct: false, consequence: 'Works for rallies, not undecideds. You lose independents.' },
    ],
    explanation: 'Quick accountability is less damaging than a cover-up.',
  },
  {
    text: 'You\'re running 10 points behind in the polls with two weeks left.',
    options: [
      { text: 'Double down on earned media — local town halls every night.', correct: true, consequence: 'Authentic momentum builds. Polls tighten.' },
      { text: 'Pull negative ads targeting your opponent\'s family.', correct: false, consequence: 'Backlash is swift. You drop 5 more points.' },
      { text: 'Stop campaigning and hope for a gaffe from your opponent.', correct: false, consequence: 'Passive strategy reads as giving up. Donors pull out.' },
      { text: 'Announce a radical new policy to grab headlines.', correct: false, consequence: 'Pivot feels desperate. Core supporters confused.' },
    ],
    explanation: 'Ground-level engagement outperforms hail-mary tactics.',
  },
  {
    text: 'An audience member asks you to name the price of a gallon of milk.',
    options: [
      { text: 'Give an honest approximate range and acknowledge you\'re focused on bigger issues.', correct: true, consequence: 'Honest humility lands well. You seem grounded.' },
      { text: 'Guess a wildly incorrect number confidently.', correct: false, consequence: 'The clip goes viral. "Out of touch" becomes the headline.' },
      { text: 'Refuse to answer and move on.', correct: false, consequence: 'Evasion looks worse than not knowing.' },
      { text: 'Lecture the audience about supply chain economics.', correct: false, consequence: 'Condescending. The room turns cold.' },
    ],
    explanation: 'Voters reward self-awareness over false confidence.',
  },
  {
    text: 'Your opponent claims you\'ve never held a real job.',
    options: [
      { text: 'Cite specific work history and pivot to your policy record.', correct: true, consequence: 'Facts on the table. Opponent\'s line falls flat.' },
      { text: 'Attack their wealth and privileges instead.', correct: false, consequence: 'Feels like whataboutism. Issue stays on you.' },
      { text: 'Laugh it off and say nothing.', correct: false, consequence: 'Silence reads as concession. Clip replays all night.' },
      { text: 'Ask the moderator to intervene.', correct: false, consequence: 'You look thin-skinned. Opponent smirks.' },
    ],
    explanation: 'Answering directly is always stronger than deflecting.',
  },
  {
    text: 'Time is almost up and you haven\'t made your closing statement.',
    options: [
      { text: 'Deliver a crisp, practiced 30-second close focused on one key message.', correct: true, consequence: 'The final word belongs to you. Strong impression.' },
      { text: 'Try to cram in five policy points.', correct: false, consequence: 'You get cut off mid-sentence. Messy ending.' },
      { text: 'Ask for extra time and argue with the moderator.', correct: false, consequence: 'You look entitled. The audience cringes.' },
      { text: 'Skip the close and thank the audience.', correct: false, consequence: 'Wasted opportunity. Your opponent\'s message sticks.' },
    ],
    explanation: 'The last thing voters hear defines their memory of the debate.',
  },
]

interface Props { onClose: () => void; onCancel: () => void }

export function DebateMinigame({ onClose, onCancel }: Props) {
  const supporters = useGameStore((s) => s.supporters)
  const completeMinigame = useGameStore((s) => s.completeMinigame)

  const snap = useMemo(() => ({ supporters }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const TOTAL = 3
  const questions = useMemo(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, TOTAL).map((q) => {
      const correct = q.options.find((o) => o.correct)!
      const wrong = q.options.filter((o) => !o.correct).sort(() => Math.random() - 0.5).slice(0, 2)
      return {
        ...q,
        options: [...wrong, correct].sort(() => Math.random() - 0.5),
      }
    })
  }, [])

  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)  // can go negative
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const current = questions[qIndex]!

  // Per-question reward/penalty — frozen from snapshot
  const perQ = Math.floor(snap.supporters * 0.06)
  const penalty = Math.floor(snap.supporters * 0.03)

  function handleAnswer(idx: number) {
    if (selectedIdx !== null) return
    setSelectedIdx(idx)
    const correct = current.options[idx]!.correct
    setScore((s) => s + (correct ? 1 : -1))

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        setDone(true)
      } else {
        setQIndex((q) => q + 1)
        setSelectedIdx(null)
      }
    }, 1200)
  }

  function handleClaim() {
    // score range: -TOTAL to +TOTAL
    const gain = Math.max(0, score * perQ)
    const loss = Math.max(0, -score * penalty)
    completeMinigame('debate', gain)
    if (loss > 0) {
      useGameStore.setState((s) => ({
        supporters: Math.max(0, s.supporters - loss),
      }))
    }
    onClose()
  }

  if (done) {
    const gain = Math.max(0, score * perQ)
    const loss = Math.max(0, -score * penalty)
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div className="text-4xl">{score >= 2 ? '🏆' : score >= 0 ? '👏' : '😬'}</div>
          <h2 className="text-xl font-bold">Debate Over</h2>
          <div className="text-gray-500 text-sm">
            Score: {score > 0 ? '+' : ''}{score} / {TOTAL}
          </div>
          <div className="space-y-2">
            {gain > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-xl font-bold text-green-700">+{formatNumber(gain)}</div>
                <div className="text-xs text-green-600">supporters rallied</div>
              </div>
            )}
            {loss > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="text-xl font-bold text-red-700">−{formatNumber(loss)}</div>
                <div className="text-xs text-red-600">supporters lost from backlash</div>
              </div>
            )}
            {gain === 0 && loss === 0 && (
              <div className="text-gray-400 text-sm">No net change — a wash.</div>
            )}
          </div>
          <button onClick={handleClaim} className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl">
            Continue
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
            <div className="text-3xl mb-1">🎙️</div>
            <h2 className="text-xl font-bold">Televised Debate</h2>
            <div className="text-xs text-gray-400">Question {qIndex + 1} of {TOTAL}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Right: +{formatNumber(perQ)} supporters · Wrong: −{formatNumber(penalty)} supporters
            </div>
          </div>
          {qIndex === 0 && selectedIdx === null && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">✕</button>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm font-medium text-gray-800">
          {current.text}
        </div>

        <div className="space-y-2">
          {current.options.map((opt, idx) => {
            let style = 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
            if (selectedIdx !== null) {
              if (opt.correct) style = 'border-green-400 bg-green-50'
              else if (idx === selectedIdx) style = 'border-red-400 bg-red-50'
              else style = 'border-gray-100 bg-gray-50 opacity-40'
            }
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-3 border-2 rounded-xl text-left text-sm transition-colors ${style}`}
              >
                <div>{opt.text}</div>
                {selectedIdx !== null && (
                  <div className={`text-xs mt-1 ${opt.correct ? 'text-green-600' : idx === selectedIdx ? 'text-red-500' : 'text-gray-400'}`}>
                    {opt.consequence}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selectedIdx !== null && (
          <div className="mt-3 text-xs text-gray-500 italic text-center">{current.explanation}</div>
        )}
      </div>
    </div>
  )
}
