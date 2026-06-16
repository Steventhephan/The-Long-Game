import { useState, useRef, useEffect } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { StatsBar } from '../ui/StatsBar'
import { KnockPanel } from '../panels/KnockPanel'
import { BuildingsPanel } from '../panels/BuildingsPanel'
import { UpgradesPanel } from '../panels/UpgradesPanel'
import { MinigamesPanel } from '../panels/MinigamesPanel'
import { useGameStore } from '../../store/gameStore'
import { getAvailableUpgrades, getPendingMilestones, getBuildingCost } from '../../game/selectors'

const DESKTOP_TABS = [
  { id: 'upgrades', label: 'Upgrades', emoji: '⬆️' },
  { id: 'staff', label: 'Staff', emoji: '🙋' },
  { id: 'outreach', label: 'Outreach', emoji: '📢' },
]

export function Layout() {
  const [tab, setTab] = useState('campaign')
  // On desktop the right panel always shows one of the non-campaign tabs
  const [desktopTab, setDesktopTab] = useState('upgrades')
  const [showOutreachTooltip, setShowOutreachTooltip] = useState(false)
  const outreachNotified = useRef(false)
  const [showPrestigeTooltip, setShowPrestigeTooltip] = useState(false)
  const prestigeNotified = useRef(false)

  const state = useGameStore((s) => s)
  const prestigePoints = useGameStore((s) => s.prestigePoints)
  const seenIds = useRef(new Set<string>())
  const seenStaffIds = useRef(new Set<string>())
  const buildings = useGameStore((s) => s.buildings)
  const totalSupportersEarned = useGameStore((s) => s.totalSupportersEarned)
  const cash = useGameStore((s) => s.cash)

  const availableUpgrades = getAvailableUpgrades(state)
  const pendingMilestones = getPendingMilestones(state)
  const allRewardIds = [...availableUpgrades.map((u) => u.id), ...pendingMilestones.map((m) => m.id)]

  const unseenIds = allRewardIds.filter((id) => !seenIds.current.has(id))
  const rewardsBadge = (t: string) => (t === 'upgrades' ? 0 : unseenIds.length)

  const unseenUpgrades = availableUpgrades.filter((u) => !seenIds.current.has(u.id))
  const unseenMilestones = pendingMilestones.filter((m) => !seenIds.current.has(m.id))
  const upgradesBadgeAffordable = unseenUpgrades.some((u) => cash >= u.cost) || unseenMilestones.length > 0

  const visibleBuildingIds = Object.values(buildings)
    .filter((b) => totalSupportersEarned >= b.unlockAt || b.count > 0)
    .map((b) => b.id)

  const staffBadge = (t: string) =>
    t === 'staff' ? 0 : visibleBuildingIds.filter((id) => !seenStaffIds.current.has(id)).length

  const anyMinigameUnlocked = Object.values(state.minigames).some((mg) => mg.unlocked)
  const lockedTabs = anyMinigameUnlocked ? new Set<string>() : new Set(['outreach'])

  // Show outreach tooltip the first time it unlocks
  useEffect(() => {
    if (anyMinigameUnlocked && !outreachNotified.current) {
      outreachNotified.current = true
      setShowOutreachTooltip(true)
      setTimeout(() => setShowOutreachTooltip(false), 4000)
    }
  }, [anyMinigameUnlocked])

  // Show prestige points bubble after a prestige reset
  useEffect(() => {
    if (prestigePoints > 0 && !prestigeNotified.current) {
      prestigeNotified.current = true
      setShowPrestigeTooltip(true)
      setTimeout(() => setShowPrestigeTooltip(false), 6000)
    }
  }, [prestigePoints])

  // Staff badge: gray unless player can afford at least one building
  const staffBadgeAffordable = Object.values(buildings).some((b) => {
    if (b.autoRecruit) return false
    const visible = totalSupportersEarned >= b.unlockAt || b.count > 0
    if (!visible) return false
    const id = b.id
    const unseenNew = !seenStaffIds.current.has(id)
    return unseenNew && cash >= getBuildingCost(state, id)
  })

  function markSeen(newTab: string) {
    if (newTab === 'upgrades') {
      for (const id of allRewardIds) seenIds.current.add(id)
    }
    if (newTab === 'staff') {
      for (const id of visibleBuildingIds) seenStaffIds.current.add(id)
    }
  }

  function handleTabChange(newTab: string) {
    if (lockedTabs.has(newTab)) return
    markSeen(newTab)
    setTab(newTab)
  }

  function handleDesktopTabChange(newTab: string) {
    if (lockedTabs.has(newTab)) return
    markSeen(newTab)
    setDesktopTab(newTab)
  }

  const badges = { upgrades: rewardsBadge(tab), staff: staffBadge(tab) }
  const badgeAffordable = { upgrades: upgradesBadgeAffordable, staff: staffBadgeAffordable }

  return (
    <>
      {/* ── Mobile layout ───────────────────────────────── */}
      <div className="flex flex-col h-dvh lg:hidden bg-gray-50">
        <Header />
        <StatsBar />
        <main className="flex-1 overflow-y-auto">
          {tab === 'campaign' && <KnockPanel />}
          {tab === 'upgrades' && <UpgradesPanel />}
          {tab === 'staff' && <BuildingsPanel />}
          {tab === 'outreach' && <MinigamesPanel />}
        </main>
        <div className="relative flex-shrink-0">
          {showOutreachTooltip && (
            <div className="absolute bottom-full right-4 mb-2 z-20 pointer-events-none">
              <div className="bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap">
                📢 Outreach Activities Unlocked!
                <div className="absolute bottom-0 right-8 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-purple-700" style={{ borderTopWidth: 6 }} />
              </div>
            </div>
          )}
          {showPrestigeTooltip && (
            <div className="absolute bottom-full left-[37.5%] -translate-x-1/2 mb-2 z-20 pointer-events-none">
              <div className="bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap">
                ⭐ Prestige rewards available
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-yellow-500" style={{ borderTopWidth: 6 }} />
              </div>
            </div>
          )}
          <TabBar
            active={tab}
            onChange={handleTabChange}
            badges={badges}
            badgeAffordable={badgeAffordable}
            lockedTabs={lockedTabs}
          />
        </div>
      </div>

      {/* ── Desktop layout ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col h-dvh bg-gray-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* Left column: Campaign */}
          <div className="w-96 flex-shrink-0 flex flex-col bg-gray-50 border-r border-gray-200 overflow-hidden">
            <StatsBar />
            <div className="flex-1 overflow-y-auto">
              <KnockPanel />
            </div>
          </div>

          {/* Right column: Upgrades / Staff / Outreach */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Desktop tab nav */}
            <nav className="flex border-b border-gray-200 bg-white flex-shrink-0">
              {DESKTOP_TABS.map((t) => {
                const badge = t.id === 'upgrades' ? rewardsBadge(desktopTab) : staffBadge(desktopTab)
                const affordable = t.id === 'upgrades' ? upgradesBadgeAffordable : true
                const locked = lockedTabs.has(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => handleDesktopTabChange(t.id)}
                    disabled={locked}
                    className={`
                      flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 relative
                      ${locked ? 'text-gray-300 cursor-not-allowed border-transparent'
                        : desktopTab === t.id
                          ? 'text-blue-700 border-blue-700'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    <span className="relative">
                      {locked ? '🔒' : t.emoji}
                      {t.id === 'outreach' && showOutreachTooltip && !locked && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-purple-700 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
                          Unlocked!
                        </span>
                      )}
                      {t.id === 'upgrades' && showPrestigeTooltip && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
                          ⭐ Prestige rewards available
                        </span>
                      )}
                      {!locked && badge > 0 && (
                        <span className={`absolute -top-1 -right-2 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none
                          ${affordable ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-gray-100'}`}>
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </span>
                    {locked ? 'Locked' : t.label}
                  </button>
                )
              })}
            </nav>
            <div className="flex-1 overflow-y-auto">
              {desktopTab === 'upgrades' && <UpgradesPanel />}
              {desktopTab === 'staff' && <BuildingsPanel />}
              {desktopTab === 'outreach' && <MinigamesPanel />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
