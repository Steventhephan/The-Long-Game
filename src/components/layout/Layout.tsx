import { useState, useRef } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { StatsBar } from '../ui/StatsBar'
import { KnockPanel } from '../panels/KnockPanel'
import { BuildingsPanel } from '../panels/BuildingsPanel'
import { UpgradesPanel } from '../panels/UpgradesPanel'
import { MinigamesPanel } from '../panels/MinigamesPanel'
import { useGameStore } from '../../store/gameStore'
import { getAvailableUpgrades, getPendingMilestones } from '../../game/selectors'

const DESKTOP_TABS = [
  { id: 'upgrades', label: 'Upgrades', emoji: '⬆️' },
  { id: 'staff', label: 'Staff', emoji: '🙋' },
  { id: 'outreach', label: 'Outreach', emoji: '📢' },
]

export function Layout() {
  const [tab, setTab] = useState('campaign')
  // On desktop the right panel always shows one of the non-campaign tabs
  const [desktopTab, setDesktopTab] = useState('upgrades')

  const state = useGameStore((s) => s)
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
  const badgeAffordable = { upgrades: upgradesBadgeAffordable, staff: true }

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
        <TabBar
          active={tab}
          onChange={handleTabChange}
          badges={badges}
          badgeAffordable={badgeAffordable}
          lockedTabs={lockedTabs}
        />
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
