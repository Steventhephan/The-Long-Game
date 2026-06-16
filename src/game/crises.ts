export type CrisisOutcome =
  | { type: 'supporters_pct'; value: number }   // fraction of threshold gained/lost
  | { type: 'competitor_pct'; value: number }   // lead competitor gains/loses this fraction
  | { type: 'none' }

export type CrisisOptionOutcome =
  | CrisisOutcome
  | { type: 'random'; chance: number; good: CrisisOutcome; bad: CrisisOutcome }

export interface CrisisOption {
  label: string
  emoji: string
  costFraction: number   // fraction of election threshold charged as cash
  description: string    // shown before picking
  riskLabel: string      // "Safe" | "Risky" | "Bold"
}

export interface CrisisDef {
  id: string
  headline: string
  description: string
  options: [CrisisOption & { outcome: CrisisOptionOutcome },
            CrisisOption & { outcome: CrisisOptionOutcome },
            CrisisOption & { outcome: CrisisOptionOutcome }]
}

export const CRISES: CrisisDef[] = [
  {
    id: 'leaked_memo',
    headline: 'Leaked Memo Surfaces',
    description: 'An internal memo linking your campaign to a foreign PAC has reached the press. Reporters are demanding a statement.',
    options: [
      { label: 'Deny Everything', emoji: '🙅', costFraction: 0, riskLabel: 'Risky',
        description: '40% it blows over — 60% it backfires badly.',
        outcome: { type: 'random', chance: 0.40, good: { type: 'none' }, bad: { type: 'supporters_pct', value: -0.08 } } },
      { label: 'Issue Apology', emoji: '🙏', costFraction: 0.003, riskLabel: 'Safe',
        description: 'Spend cash. Lose some supporters. Story ends today.',
        outcome: { type: 'supporters_pct', value: -0.03 } },
      { label: 'Go On Offense', emoji: '⚔️', costFraction: 0.006, riskLabel: 'Bold',
        description: 'Attack a rival. Their lead takes a hit.',
        outcome: { type: 'competitor_pct', value: -0.06 } },
    ],
  },
  {
    id: 'attack_ad',
    headline: 'Rival Runs Attack Ad',
    description: 'Your lead opponent just dropped a damaging ad in prime-time slots. Voters are noticing.',
    options: [
      { label: 'Ignore It', emoji: '😶', costFraction: 0, riskLabel: 'Risky',
        description: '50% it fades — 50% it costs you supporters.',
        outcome: { type: 'random', chance: 0.50, good: { type: 'none' }, bad: { type: 'supporters_pct', value: -0.05 } } },
      { label: 'Run Counter-Ad', emoji: '📺', costFraction: 0.004, riskLabel: 'Safe',
        description: 'Spend to neutralize. No supporter loss.',
        outcome: { type: 'none' } },
      { label: 'Dig Up Dirt', emoji: '🔍', costFraction: 0.008, riskLabel: 'Bold',
        description: 'Release opposition research. Rival loses ground.',
        outcome: { type: 'competitor_pct', value: -0.08 } },
    ],
  },
  {
    id: 'gaffe',
    headline: 'Rally Gaffe Goes Viral',
    description: 'A poorly-worded line at your last rally is being replayed everywhere. The internet is not kind.',
    options: [
      { label: 'Laugh It Off', emoji: '😂', costFraction: 0, riskLabel: 'Risky',
        description: '40% sympathy boost — 60% it compounds the damage.',
        outcome: { type: 'random', chance: 0.40, good: { type: 'supporters_pct', value: 0.03 }, bad: { type: 'supporters_pct', value: -0.06 } } },
      { label: 'Issue Statement', emoji: '📝', costFraction: 0, riskLabel: 'Safe',
        description: 'Free. Lose a few supporters. Story moves on.',
        outcome: { type: 'supporters_pct', value: -0.02 } },
      { label: 'Media Blitz', emoji: '🎙️', costFraction: 0.005, riskLabel: 'Bold',
        description: 'Flood the airwaves. 60% you turn it into a moment.',
        outcome: { type: 'random', chance: 0.6, good: { type: 'supporters_pct', value: 0.05 }, bad: { type: 'supporters_pct', value: -0.08 } } },
    ],
  },
  {
    id: 'staff_defection',
    headline: 'Key Staffer Defects',
    description: 'Your deputy campaign manager just joined a rival campaign and is speaking to reporters.',
    options: [
      { label: 'Let Them Go', emoji: '🚪', costFraction: 0, riskLabel: 'Safe',
        description: 'Free. Small supporter loss. You move on.',
        outcome: { type: 'supporters_pct', value: -0.02 } },
      { label: 'Pay Their Silence', emoji: '🤫', costFraction: 0.005, riskLabel: 'Safe',
        description: 'Spend cash. No story runs. No consequence.',
        outcome: { type: 'none' } },
      { label: 'Dismiss Them Publicly', emoji: '📣', costFraction: 0, riskLabel: 'Risky',
        description: '45% voters side with you — 55% it looks petty.',
        outcome: { type: 'random', chance: 0.45, good: { type: 'supporters_pct', value: 0.04 }, bad: { type: 'supporters_pct', value: -0.07 } } },
    ],
  },
  {
    id: 'poll_collapse',
    headline: 'Internal Poll Numbers Slip',
    description: 'Leaked data shows you have lost ground among key demographics overnight. Donors are getting nervous.',
    options: [
      { label: 'Dismiss the Poll', emoji: '🙄', costFraction: 0, riskLabel: 'Risky',
        description: '45% nothing happens — 55% donors pull back.',
        outcome: { type: 'random', chance: 0.45, good: { type: 'none' }, bad: { type: 'supporters_pct', value: -0.05 } } },
      { label: 'Emergency Outreach', emoji: '📞', costFraction: 0.003, riskLabel: 'Safe',
        description: 'Spend cash. Steady the ship. Small supporter loss.',
        outcome: { type: 'supporters_pct', value: -0.02 } },
      { label: 'Pivot the Message', emoji: '🔄', costFraction: 0.007, riskLabel: 'Bold',
        description: 'Retool your pitch. Recover lost ground.',
        outcome: { type: 'supporters_pct', value: 0.04 } },
    ],
  },
  {
    id: 'endorsement_pulled',
    headline: 'Major Endorsement Withdrawn',
    description: 'A prominent local figure has pulled their endorsement, citing "new concerns." Media is covering it.',
    options: [
      { label: 'Public Statement', emoji: '📢', costFraction: 0, riskLabel: 'Safe',
        description: 'Free. Small supporter loss. You move on.',
        outcome: { type: 'supporters_pct', value: -0.025 } },
      { label: 'Reach Out Privately', emoji: '📞', costFraction: 0.003, riskLabel: 'Safe',
        description: 'Resolve it quietly. No public fallout.',
        outcome: { type: 'none' } },
      { label: 'Secure a Replacement', emoji: '🤝', costFraction: 0.007, riskLabel: 'Bold',
        description: 'Announce a bigger endorser. Net supporter gain.',
        outcome: { type: 'supporters_pct', value: 0.04 } },
    ],
  },
  {
    id: 'protest',
    headline: 'Protesters Disrupt Rally',
    description: 'A vocal group crashed your biggest rally of the week. Footage is spreading across every platform.',
    options: [
      { label: 'Engage Publicly', emoji: '🤲', costFraction: 0, riskLabel: 'Risky',
        description: '40% sympathy boost — 60% looks chaotic.',
        outcome: { type: 'random', chance: 0.40, good: { type: 'supporters_pct', value: 0.05 }, bad: { type: 'supporters_pct', value: -0.05 } } },
      { label: 'Continue the Rally', emoji: '🎤', costFraction: 0, riskLabel: 'Safe',
        description: 'Free. Small supporter loss. Donors stay calm.',
        outcome: { type: 'supporters_pct', value: -0.02 } },
      { label: 'Invite Dialogue', emoji: '🫱', costFraction: 0.004, riskLabel: 'Bold',
        description: 'Look presidential. Net supporter gain.',
        outcome: { type: 'supporters_pct', value: 0.04 } },
    ],
  },
  {
    id: 'finance_leak',
    headline: 'Finance Records Leaked',
    description: 'Campaign finance data spanning several years has reached a major outlet. An investigation is being teased.',
    options: [
      { label: 'Stonewall', emoji: '🧱', costFraction: 0, riskLabel: 'Risky',
        description: '45% story dies — 55% it escalates badly.',
        outcome: { type: 'random', chance: 0.45, good: { type: 'none' }, bad: { type: 'supporters_pct', value: -0.10 } } },
      { label: 'Voluntary Disclosure', emoji: '📂', costFraction: 0, riskLabel: 'Safe',
        description: 'Free. Lose supporters but the story ends fast.',
        outcome: { type: 'supporters_pct', value: -0.04 } },
      { label: 'Hire Lawyers', emoji: '⚖️', costFraction: 0.008, riskLabel: 'Safe',
        description: 'Expensive but the story is suppressed entirely.',
        outcome: { type: 'none' } },
    ],
  },
]

// Resolve a random outcome at dismiss time
export function resolveCrisisOutcome(
  outcome: CrisisOptionOutcome
): CrisisOutcome {
  if (outcome.type === 'random') {
    return Math.random() < outcome.chance ? outcome.good : outcome.bad
  }
  return outcome
}
