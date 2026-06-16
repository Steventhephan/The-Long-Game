import { useGameStore } from '../../store/gameStore'
import { getVolunteerRecruitRate, getVolunteerProductionMult } from '../../game/selectors'
import { formatNumber, formatCash, formatCashRate, formatRate } from '../../game/persistence'

export function StatsBar() {
  const supporters = useGameStore((s) => s.supporters)
  const supportersPerSecond = useGameStore((s) => s.supportersPerSecond)
  const cash = useGameStore((s) => s.cash)
  const cashPerSecond = useGameStore((s) => s.cashPerSecond)
  const volunteerCount = useGameStore((s) => s.buildings.volunteer.count)
  const knockBoostSps = useGameStore((s) => s.knockBoostSps)
  const knockBoostCps = useGameStore((s) => s.knockBoostCps)
  const fundraiseBoostCps = useGameStore((s) => s.fundraiseBoostCps)
  const lastClickedForCash = useGameStore((s) => s.lastClickedForCash)
  const state = useGameStore((s) => s)
  const recruitRate = getVolunteerRecruitRate(state)
  const volunteerMult = getVolunteerProductionMult(state)

  const displaySps = supportersPerSecond + knockBoostSps
  const displayCps = cashPerSecond + knockBoostCps + fundraiseBoostCps
  const isKnocking = knockBoostSps > 0

  // Cash rate turns green only when the last-clicked button is still the dominant cash source.
  // This signals to the player which button is producing the best cash at this moment.
  const isCashGreen =
    lastClickedForCash === 'fundraise'
      ? fundraiseBoostCps > 0 && fundraiseBoostCps >= knockBoostCps
      : lastClickedForCash === 'knock'
        ? knockBoostCps > 0 && knockBoostCps >= fundraiseBoostCps
        : false

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
        <div className={`text-[10px] ${isCashGreen ? 'text-green-300 font-semibold' : 'text-blue-400'}`}>
          +{formatCashRate(displayCps)}/s
        </div>
      </div>
      <div className="text-center">
        <div className="font-bold leading-tight text-orange-300">{volunteerCount}</div>
        <div className="text-blue-300 text-[10px]">volunteers</div>
        <div className="text-blue-400 text-[10px]">
          +{formatRate(recruitRate)}/s
          {volunteerMult >= 1.1 && (
            <span className="text-orange-300 ml-1">· {volunteerMult.toFixed(1)}×</span>
          )}
        </div>
      </div>
    </div>
  )
}
