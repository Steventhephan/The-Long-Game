import { useGameStore } from '../../store/gameStore'
import { getVolunteerRecruitRate } from '../../game/selectors'
import { formatNumber, formatCash, formatCashRate, formatRate } from '../../game/persistence'

export function StatsBar() {
  const supporters = useGameStore((s) => s.supporters)
  const supportersPerSecond = useGameStore((s) => s.supportersPerSecond)
  const cash = useGameStore((s) => s.cash)
  const cashPerSecond = useGameStore((s) => s.cashPerSecond)
  const volunteerCount = useGameStore((s) => s.buildings.volunteer.count)
  const knockBoostSps = useGameStore((s) => s.knockBoostSps)
  const knockBoostCps = useGameStore((s) => s.knockBoostCps)
  const state = useGameStore((s) => s)
  const recruitRate = getVolunteerRecruitRate(state)

  const displaySps = supportersPerSecond + knockBoostSps
  const displayCps = cashPerSecond + knockBoostCps
  const isKnocking = knockBoostSps > 0

  return (
    <div className="bg-blue-900 text-white px-3 py-1.5 grid grid-cols-3 gap-1 text-xs border-b border-blue-800">
      <div className="text-center">
        <div className="font-bold leading-tight">{formatNumber(supporters)}</div>
        <div className="text-blue-300 text-[10px]">supporters</div>
        <div className={`text-[10px] ${isKnocking ? 'text-green-300 font-semibold' : 'text-blue-400'}`}>
          +{formatRate(displaySps)}/s
        </div>
      </div>
      <div className="text-center border-x border-blue-700">
        <div className="font-bold leading-tight text-green-300">{formatCash(cash)}</div>
        <div className="text-blue-300 text-[10px]">cash</div>
        <div className={`text-[10px] ${isKnocking ? 'text-green-300 font-semibold' : 'text-blue-400'}`}>
          +{formatCashRate(displayCps)}/s
        </div>
      </div>
      <div className="text-center">
        <div className="font-bold leading-tight text-orange-300">{volunteerCount}</div>
        <div className="text-blue-300 text-[10px]">volunteers</div>
        <div className="text-blue-400 text-[10px]">+{formatRate(recruitRate)}/s</div>
      </div>
    </div>
  )
}
