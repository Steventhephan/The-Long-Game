import type { MinigameDef } from '../types';

// Content authored per Design Pillar 5b: no answer is "the correct politics."
// Each choice gives genuine tradeoffs — no option is strictly dominant.

export const MINIGAMES: MinigameDef[] = [

  // ── Debates (mandatory, one per election at County+ era) ──────────────────

  {
    id: 'debate_taxes',
    type: 'debate',
    mandatory: false,
    unlockEra: 'county',
    title: 'Primary Debate',
    prompt: '"Candidate, the voters want to know: where do you stand on taxes and government spending?"',
    choices: [
      {
        id: 'raise',
        text: '"Raise taxes on the wealthy to fund critical programs and infrastructure."',
        effects: [
          { kind: 'stanceCommit', issueId: 'taxes_spending', stanceId: 'far_left' },
          { kind: 'blocSupport', groupId: 'labor_unions',       delta:  0.4 },
          { kind: 'blocSupport', groupId: 'teachers',           delta:  0.3 },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta: -0.2 },
          { kind: 'blocSupport', groupId: 'energy_industry',    delta: -0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'balance',
        text: '"Balance the budget responsibly — no new taxes until we cut the waste."',
        effects: [
          { kind: 'stanceCommit', issueId: 'taxes_spending', stanceId: 'center' },
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'retirees_seniors',   delta:  0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'cut',
        text: '"Cut taxes and free the private sector to grow the economy for everyone."',
        effects: [
          { kind: 'stanceCommit', issueId: 'taxes_spending', stanceId: 'far_right' },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta:  0.4 },
          { kind: 'blocSupport', groupId: 'energy_industry',       delta:  0.3 },
          { kind: 'blocSupport', groupId: 'labor_unions',          delta: -0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
    ],
  },

  {
    id: 'debate_healthcare',
    type: 'debate',
    mandatory: false,
    unlockEra: 'county',
    title: 'Town Debate',
    prompt: '"The number one issue on voters\' minds is healthcare. What\'s your plan?"',
    choices: [
      {
        id: 'universal',
        text: '"Universal coverage for every citizen — healthcare is a right, not a privilege."',
        effects: [
          { kind: 'stanceCommit', issueId: 'healthcare', stanceId: 'far_left' },
          { kind: 'blocSupport', groupId: 'labor_unions',          delta:  0.3 },
          { kind: 'blocSupport', groupId: 'teachers',              delta:  0.2 },
          { kind: 'blocSupport', groupId: 'healthcare_industry',   delta: -0.2 },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta: -0.1 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'expand',
        text: '"Expand access and lower costs while preserving patient choice."',
        effects: [
          { kind: 'stanceCommit', issueId: 'healthcare', stanceId: 'center' },
          { kind: 'blocSupport', groupId: 'suburban_moderates',   delta:  0.3 },
          { kind: 'blocSupport', groupId: 'healthcare_industry',  delta:  0.2 },
          { kind: 'blocSupport', groupId: 'retirees_seniors',     delta:  0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'market',
        text: '"Get government out of the way and let market competition drive down costs."',
        effects: [
          { kind: 'stanceCommit', issueId: 'healthcare', stanceId: 'far_right' },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'healthcare_industry',   delta:  0.2 },
          { kind: 'blocSupport', groupId: 'labor_unions',          delta: -0.3 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
    ],
  },

  {
    id: 'debate_policing',
    type: 'debate',
    mandatory: false,
    unlockEra: 'county',
    title: 'Public Safety Forum',
    prompt: '"Residents are divided on public safety and policing. Where do you stand, Candidate?"',
    choices: [
      {
        id: 'reform',
        text: '"Reform policing, increase accountability, and invest in community programs."',
        effects: [
          { kind: 'stanceCommit', issueId: 'policing', stanceId: 'far_left' },
          { kind: 'blocSupport', groupId: 'civil_liberties',     delta:  0.4 },
          { kind: 'blocSupport', groupId: 'teachers',            delta:  0.2 },
          { kind: 'blocSupport', groupId: 'law_enforcement',     delta: -0.4 },
          { kind: 'blocSupport', groupId: 'suburban_moderates',  delta: -0.1 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'balance',
        text: '"We need smarter policing — better training, better accountability, better results."',
        effects: [
          { kind: 'stanceCommit', issueId: 'policing', stanceId: 'center' },
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'retirees_seniors',   delta:  0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'back_blue',
        text: '"Back our officers fully — fund law enforcement and get tough on crime."',
        effects: [
          { kind: 'stanceCommit', issueId: 'policing', stanceId: 'far_right' },
          { kind: 'blocSupport', groupId: 'law_enforcement',     delta:  0.5 },
          { kind: 'blocSupport', groupId: 'faith_community',     delta:  0.2 },
          { kind: 'blocSupport', groupId: 'civil_liberties',     delta: -0.4 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
    ],
  },

  // ── Town Halls (optional, cooldown 60s, costs cash) ───────────────────────

  {
    id: 'town_hall_education',
    type: 'town_hall',
    unlockEra: 'county',
    cooldownSeconds: 60,
    cashCost: 300,
    title: 'Town Hall — Schools',
    prompt: 'A worried parent asks at your town hall: "Our schools are failing our kids. What will you actually do about it?"',
    choices: [
      {
        id: 'fund_public',
        text: '"Fully fund public schools. Every child deserves a great education, full stop."',
        effects: [
          { kind: 'blocSupport', groupId: 'teachers',              delta:  0.5 },
          { kind: 'blocSupport', groupId: 'labor_unions',         delta:  0.2 },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta: -0.1 },
          { kind: 'charisma',    delta: 2 },
        ],
      },
      {
        id: 'improve_budget',
        text: '"Improve outcomes within our budget — smarter spending, not just more spending."',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'retirees_seniors',   delta:  0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'school_choice',
        text: '"Expand school choice — competition and parental control will raise the bar."',
        effects: [
          { kind: 'blocSupport', groupId: 'faith_community',    delta:  0.3 },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta:  0.2 },
          { kind: 'blocSupport', groupId: 'teachers',           delta: -0.3 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
    ],
  },

  {
    id: 'town_hall_housing',
    type: 'town_hall',
    unlockEra: 'county',
    cooldownSeconds: 60,
    cashCost: 300,
    title: 'Town Hall — Housing',
    prompt: 'Residents are struggling to afford rent. A young family asks: "Will you fix our housing crisis?"',
    choices: [
      {
        id: 'affordable_dev',
        text: '"Expand affordable housing — zone for density, fund construction, protect renters."',
        effects: [
          { kind: 'blocSupport', groupId: 'labor_unions',          delta:  0.3 },
          { kind: 'blocSupport', groupId: 'teachers',              delta:  0.2 },
          { kind: 'blocSupport', groupId: 'developers_real_estate', delta: -0.1 },
          { kind: 'charisma',    delta: 2 },
        ],
      },
      {
        id: 'balance_growth',
        text: '"Balance smart growth with neighborhood character — we can do both."',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates',    delta:  0.4 },
          { kind: 'blocSupport', groupId: 'retirees_seniors',      delta:  0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'market_supply',
        text: '"Deregulate and let the market supply housing — get government out of the way."',
        effects: [
          { kind: 'blocSupport', groupId: 'developers_real_estate', delta:  0.4 },
          { kind: 'blocSupport', groupId: 'small_business_owners',  delta:  0.2 },
          { kind: 'blocSupport', groupId: 'labor_unions',           delta: -0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
    ],
  },

  // ── Fundraising Galas (optional, cooldown 90s, costs cash to host) ────────

  {
    id: 'fundraising_gala_donors',
    type: 'fundraising_gala',
    unlockEra: 'county',
    cooldownSeconds: 90,
    cashCost: 200,
    title: 'Donor Reception',
    prompt: 'A major donor approaches you at a private reception. "I\'d like to support your campaign — but I expect to see results on the issues I care about."',
    choices: [
      {
        id: 'accept_conditions',
        text: '"We\'re aligned. We\'ll make things happen." (Accept with implied commitment)',
        effects: [
          { kind: 'cash',        amount: 2000 },
          { kind: 'blocSupport', groupId: 'developers_real_estate', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'civil_liberties',        delta: -0.2 },
        ],
      },
      {
        id: 'accept_independent',
        text: '"I appreciate the support — but my votes are my own." (Accept, stay independent)',
        effects: [
          { kind: 'cash',     amount: 800 },
          { kind: 'charisma', delta: 1 },
        ],
      },
      {
        id: 'decline',
        text: '"Thank you, but we\'re running a different kind of campaign." (Decline)',
        effects: [
          { kind: 'charisma', delta: 3 },
        ],
      },
    ],
  },

  {
    id: 'fundraising_gala_business',
    type: 'fundraising_gala',
    unlockEra: 'county',
    cooldownSeconds: 90,
    cashCost: 200,
    title: 'Business Leaders Gala',
    prompt: 'You have five minutes with a room full of business leaders. They want to hear your economic pitch.',
    choices: [
      {
        id: 'tax_incentives',
        text: '"Tax incentives for local businesses — you invest in our community, we invest in you."',
        effects: [
          { kind: 'cash',        amount: 1500 },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta:  0.4 },
          { kind: 'blocSupport', groupId: 'labor_unions',          delta: -0.2 },
        ],
      },
      {
        id: 'infrastructure',
        text: '"Infrastructure investment is the best economic stimulus — roads, broadband, workforce."',
        effects: [
          { kind: 'cash',        amount: 1000 },
          { kind: 'blocSupport', groupId: 'developers_real_estate', delta:  0.3 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'workforce',
        text: '"Workforce development — train the talent pipeline every business here needs."',
        effects: [
          { kind: 'cash',        amount: 500 },
          { kind: 'blocSupport', groupId: 'labor_unions', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'teachers',     delta:  0.2 },
          { kind: 'charisma',    delta: 2 },
        ],
      },
    ],
  },
];

export const DEBATES         = MINIGAMES.filter(m => m.type === 'debate');
export const TOWN_HALLS      = MINIGAMES.filter(m => m.type === 'town_hall');
export const FUNDRAISING_GALAS = MINIGAMES.filter(m => m.type === 'fundraising_gala');

export function getMinigame(id: string): MinigameDef | undefined {
  return MINIGAMES.find(m => m.id === id);
}
