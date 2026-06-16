import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { getAllMilestonesAnnotated } from '../../game/selectors'
import { UPGRADES } from '../../game/upgrades'
import { NumberDisplay } from '../ui/NumberDisplay'
import { formatCash } from '../../game/persistence'
import { PRESTIGE_UPGRADES } from '../../game/prestige'

type InnerTab = 'milestones' | 'upgrades' | 'prestige'

export function UpgradesPanel() {
  const state = useGameStore((s) => s)
  const cash = useGameStore((s) => s.cash)
  const prestigePoints = useGameStore((s) => s.prestigePoints)
  const prestigeCount = useGameStore((s) => s.prestigeCount)
  const purchasedPrestigeUpgrades = useGameStore((s) => s.purchasedPrestigeUpgrades)
  const buyUpgrade = useGameStore((s) => s.buyUpgrade)
  const buyPrestigeUpgrade = useGameStore((s) => s.buyPrestigeUpgrade)
  const activateMilestone = useGameStore((s) => s.activateMilestone)

  const [tab, setTab] = useState<InnerTab>('upgrades')
  const seenUpgradeIds = useRef(new Set<string>())
  const seenMilestoneIds = useRef(new Set<string>())

  const allUpgrades = Object.values(state.upgrades)
  const purchased = [...allUpgrades.filter((u) => u.purchased)].sort((a, b) => a.cost - b.cost)
  const available = [...allUpgrades.filter((u) => !u.purchased && (UPGRADES[u.id]?.unlockCondition(state) ?? false))].sort((a, b) => a.cost - b.cost)

  const milestones = getAllMilestonesAnnotated(state)
  const pendingMilestones = milestones.filter((m) => m.status === 'pending')

  // Mark items as seen while currently viewing their tab
  useEffect(() => {
    if (tab === 'upgrades') {
      for (const u of available) seenUpgradeIds.current.add(u.id)
    }
  }, [tab, available.length])

  useEffect(() => {
    if (tab === 'milestones') {
      for (const m of pendingMilestones) seenMilestoneIds.current.add(m.def.id)
    }
  }, [tab, pendingMilestones.length])

  const unseenUpgradeCount = tab === 'upgrades'
    ? 0
    : available.filter((u) => !seenUpgradeIds.current.has(u.id)).length
  const unseenMilestoneCount = tab === 'milestones'
    ? 0
    : pendingMilestones.filter((m) => !seenMilestoneIds.current.has(m.def.id)).length

  const visiblePrestigeUpgrades = PRESTIGE_UPGRADES.filter(
    (u) => u.unlockAfterPrestiges <= prestigeCount
  )

  function handleInnerTabChange(newTab: InnerTab) {
    if (newTab === 'upgrades') {
      for (const u of available) seenUpgradeIds.current.add(u.id)
    } else if (newTab === 'milestones') {
      for (const m of pendingMilestones) seenMilestoneIds.current.add(m.def.id)
    }
    setTab(newTab)
  }

  const tabs: { id: InnerTab; label: string; badge?: number }[] = [
    { id: 'upgrades', label: 'Upgrades', badge: unseenUpgradeCount },
    { id: 'milestones', label: 'Milestones', badge: unseenMilestoneCount },
    ...(prestigeCount > 0 ? [{ id: 'prestige' as InnerTab, label: 'Prestige', badge: 0 }] : []),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Inner tab bar */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleInnerTabChange(t.id)}
            className={`flex-1 py-2.5 text-xs font-bold relative transition-colors
              ${tab === t.id ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500'}
            `}
          >
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs px-1 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* ── Milestones ─────────────────────────────────────────────── */}
        {tab === 'milestones' && (
          <section className="space-y-2">
            {milestones.map(({ def, status }) => {
              if (status === 'activated') {
                return (
                  <div key={def.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-lg flex-shrink-0">✅</div>
                    <div className="flex-1">
                      <div className="font-semibold text-xs text-gray-400">{def.name}</div>
                      <div className="text-xs text-gray-400">{def.effectLabel}</div>
                    </div>
                  </div>
                )
              }

              if (status === 'pending') {
                return (
                  <div key={def.id} className="flex items-start gap-3 p-3 rounded-lg border border-yellow-300 bg-yellow-50">
                    <div className="text-xl flex-shrink-0 mt-0.5">🏅</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-yellow-900">{def.name}</div>
                      <div className="text-xs text-yellow-700 italic mt-0.5">{def.flavour}</div>
                      <div className="text-xs text-green-700 font-medium mt-1">Effect: {def.effectLabel}</div>
                    </div>
                    <button
                      onClick={() => activateMilestone(def.id)}
                      className="flex-shrink-0 self-center px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-lg"
                    >
                      Activate
                    </button>
                  </div>
                )
              }

              return (
                <div key={def.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-gray-50 opacity-50">
                  <div className="text-lg flex-shrink-0">🔒</div>
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-gray-500">{def.name}</div>
                    <div className="text-xs text-gray-400">{def.effectLabel}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Reach <NumberDisplay value={def.supportersRequired} /> supporters
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* ── Upgrades ───────────────────────────────────────────────── */}
        {tab === 'upgrades' && (
          <section className="space-y-2">
            {purchased.length === 0 && available.length === 0 ? (
              <p className="text-xs text-gray-400">Keep campaigning — upgrades will appear here.</p>
            ) : (
              <>
                {available.map((upgrade) => {
                  const canAfford = cash >= upgrade.cost
                  return (
                    <div
                      key={upgrade.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${canAfford ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="text-xl">💵</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{upgrade.name}</div>
                        <div className="text-xs text-gray-500">{upgrade.description}</div>
                      </div>
                      <button
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={!canAfford}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold text-center ${canAfford ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        {formatCash(upgrade.cost)}
                      </button>
                    </div>
                  )
                })}
                {purchased.map((upgrade) => (
                  <div key={upgrade.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-lg">✅</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-gray-400">{upgrade.name}</div>
                      <div className="text-xs text-gray-400">{upgrade.description}</div>
                    </div>
                    <div className="text-xs text-gray-400 font-bold flex-shrink-0">Owned</div>
                  </div>
                ))}
              </>
            )}
          </section>
        )}

        {/* ── Prestige Upgrades ──────────────────────────────────────── */}
        {tab === 'prestige' && prestigeCount > 0 && (
          <section className="space-y-2">
            <div className="text-xs text-gray-500 mb-1">
              ⭐ {prestigePoints} prestige point{prestigePoints !== 1 ? 's' : ''} available
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Permanent bonuses that survive every campaign reset.
            </p>
            {visiblePrestigeUpgrades.map((def) => {
              const owned = purchasedPrestigeUpgrades[def.id] ?? false
              const canAfford = prestigePoints >= def.cost

              if (owned) {
                return (
                  <div key={def.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-lg flex-shrink-0">⭐</div>
                    <div className="flex-1">
                      <div className="font-semibold text-xs text-gray-400">{def.name}</div>
                      <div className="text-xs text-gray-400">{def.description}</div>
                    </div>
                    <div className="text-xs text-gray-400 font-bold">Owned</div>
                  </div>
                )
              }

              return (
                <div
                  key={def.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${canAfford ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="text-xl">⭐</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{def.name}</div>
                    <div className="text-xs text-gray-500">{def.description}</div>
                  </div>
                  <button
                    onClick={() => buyPrestigeUpgrade(def.id)}
                    disabled={!canAfford}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold text-center ${canAfford ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <div>{def.cost} pt{def.cost !== 1 ? 's' : ''}</div>
                  </button>
                </div>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
