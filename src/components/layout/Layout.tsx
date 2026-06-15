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

export function Layout() {
  const [tab, setTab] = useState('campaign')
  const state = useGameStore((s) => s)
  const seenIds = useRef(new Set<string>())
  const seenStaffIds = useRef(new Set<string>())
  const buildings = useGameStore((s) => s.buildings)
  const totalSupportersEarned = useGameStore((s) => s.totalSupportersEarned)

  const cash = useGameStore((s) => s.cash)

  // Available upgrades and pending milestones
  const availableUpgrades = getAvailableUpgrades(state)
  const pendingMilestones = getPendingMilestones(state)
  const allRewardIds = [...availableUpgrades.map((u) => u.id), ...pendingMilestones.map((m) => m.id)]

  // Unseen items
  const unseenIds = allRewardIds.filter((id) => !seenIds.current.has(id))
  const rewardsBadge = tab === 'upgrades' ? 0 : unseenIds.length

  // Badge is yellow only when an unseen upgrade is affordable, or an unseen milestone is pending (milestones are free)
  const unseenUpgrades = availableUpgrades.filter((u) => !seenIds.current.has(u.id))
  const unseenMilestones = pendingMilestones.filter((m) => !seenIds.current.has(m.id))
  const upgradesBadgeAffordable = unseenUpgrades.some((u) => cash >= u.cost) || unseenMilestones.length > 0

  // New buildings whose unlock threshold has been crossed
  const visibleBuildingIds = Object.values(buildings)
    .filter((b) => totalSupportersEarned >= b.unlockAt || b.count > 0)
    .map((b) => b.id)

  const staffBadge = tab === 'staff'
    ? 0
    : visibleBuildingIds.filter((id) => !seenStaffIds.current.has(id)).length

  // Outreach tab is locked until at least one minigame is unlocked
  const anyMinigameUnlocked = Object.values(state.minigames).some((mg) => mg.unlocked)
  const lockedTabs = anyMinigameUnlocked ? new Set<string>() : new Set(['outreach'])

  function handleTabChange(newTab: string) {
    if (lockedTabs.has(newTab)) return
    if (newTab === 'upgrades') {
      for (const id of allRewardIds) seenIds.current.add(id)
    }
    if (newTab === 'staff') {
      for (const id of visibleBuildingIds) seenStaffIds.current.add(id)
    }
    setTab(newTab)
  }

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-gray-50">
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
        badges={{ upgrades: rewardsBadge, staff: staffBadge }}
        badgeAffordable={{ upgrades: upgradesBadgeAffordable, staff: true }}
        lockedTabs={lockedTabs}
      />
    </div>
  )
}
