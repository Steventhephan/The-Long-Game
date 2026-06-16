import { useGameStore } from '../../store/gameStore'
import { getBuildingCost, getBuildingSps } from '../../game/selectors'
import { NumberDisplay } from '../ui/NumberDisplay'
import { formatCash } from '../../game/persistence'
import type { BuildingId } from '../../game/types'

const BUILDING_ICONS: Record<BuildingId, string> = {
  volunteer: '🙋',
  door_knocker: '🚶',
  phone_bank: '📞',
  field_office: '🏢',
  campaign_bus: '🚌',
  media_team: '📺',
  super_pac: '💰',
}

export function BuildingsPanel() {
  const state = useGameStore((s) => s)
  const cash = useGameStore((s) => s.cash)
  const totalSupportersEarned = useGameStore((s) => s.totalSupportersEarned)
  const buyBuilding = useGameStore((s) => s.buyBuilding)

  const buildings = Object.values(state.buildings)

  return (
    <div className="p-3 space-y-2">
      <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Campaign Staff</h2>

      {buildings.map((building) => {
        const sps = getBuildingSps(state, building.id)
        const unlocked = totalSupportersEarned >= building.unlockAt || building.count > 0

        if (!unlocked) return null

        if (building.autoRecruit) {
          return (
            <div key={building.id} className="flex items-start gap-3 p-3 rounded-lg border border-purple-200 bg-purple-50">
              <div className="text-2xl w-8 text-center flex-shrink-0">{BUILDING_ICONS[building.id]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{building.name}</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                    {building.count}
                  </span>
                  <span className="text-xs text-purple-400 italic">auto-recruited</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{building.description}</div>
                {sps > 0 && (
                  <div className="text-xs text-green-600 mt-0.5">
                    +<NumberDisplay value={sps} type="rate" /> supporters/s
                  </div>
                )}
              </div>
            </div>
          )
        }

        const cost = getBuildingCost(state, building.id)
        const canAfford = cash >= cost

        return (
          <div
            key={building.id}
            className={`
              flex items-start gap-3 p-3 rounded-lg border
              ${canAfford ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}
            `}
          >
            <div className="text-2xl w-8 text-center flex-shrink-0">{BUILDING_ICONS[building.id]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{building.name}</span>
                {building.count > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                    {building.count}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{building.description}</div>
              {sps > 0 && (
                <div className="text-xs text-green-600 mt-0.5">
                  Earning +<NumberDisplay value={sps} type="rate" /> supporters/s
                </div>
              )}
            </div>
            <button
              onClick={() => buyBuilding(building.id)}
              disabled={!canAfford}
              className={`
                flex-shrink-0 w-24 px-3 py-2 rounded-lg text-xs font-bold text-center
                ${canAfford
                  ? 'bg-green-600 text-white active:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              {formatCash(cost)}
            </button>
          </div>
        )
      })}
    </div>
  )
}
