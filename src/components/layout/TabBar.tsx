interface Tab {
  id: string
  label: string
  emoji: string
}

interface Props {
  active: string
  onChange: (tab: string) => void
  badges?: Record<string, number>
  badgeAffordable?: Record<string, boolean>  // true = yellow, false = gray
  lockedTabs?: Set<string>
}

const TABS: Tab[] = [
  { id: 'campaign', label: 'Campaign', emoji: '🚪' },
  { id: 'upgrades', label: 'Upgrades', emoji: '⬆️' },
  { id: 'staff', label: 'Staff', emoji: '🙋' },
  { id: 'outreach', label: 'Outreach', emoji: '📢' },
]

export function TabBar({ active, onChange, badges = {}, badgeAffordable = {}, lockedTabs = new Set() }: Props) {
  return (
    <nav className="flex border-t border-gray-200 bg-white sticky bottom-0 z-10">
      {TABS.map((tab) => {
        const badge = badges[tab.id] ?? 0
        const affordable = badgeAffordable[tab.id] ?? true
        const locked = lockedTabs.has(tab.id)

        return (
          <button
            key={tab.id}
            onClick={() => !locked && onChange(tab.id)}
            disabled={locked}
            className={`
              flex-1 flex flex-col items-center py-2 text-xs gap-0.5 relative
              ${locked ? 'text-gray-300 cursor-not-allowed' : active === tab.id ? 'text-blue-700 border-t-2 border-blue-700' : 'text-gray-500'}
            `}
          >
            <span className="text-lg relative">
              {locked ? '🔒' : tab.emoji}
              {!locked && badge > 0 && (
                <span className={`absolute -top-1 -right-2 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none
                  ${affordable ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-gray-100'}`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className={locked ? 'text-gray-400' : ''}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
