import type { EventDef } from '../types';

// 9 starter events per Events & Crises design doc.
// All authored per Pillar 5b: no choice is "correct politics."
// Negative events are survivable through choices, boosts, or out-converting (Pillar 5a).

export const EVENTS: EventDef[] = [

  // ── Dilemma events (race pauses, player picks a response) ────────────────

  {
    id: 'scandal_breaks',
    name: 'Scandal Breaks',
    type: 'dilemma',
    valence: 'negative',
    triggerType: 'state',
    stateCheck: 'heavy_flips',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    prompt: 'A reporter is running a story about your policy reversals. How do you respond before the story breaks?',
    choices: [
      {
        id: 'deny',
        text: '"There\'s no story here — these are consistent, principled positions."',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.2 },
          { kind: 'blocSupport', groupId: 'labor_unions',        delta: -0.3 },
          { kind: 'blocSupport', groupId: 'civil_liberties',     delta: -0.2 },
        ],
      },
      {
        id: 'apologize',
        text: '"I\'ve grown in my thinking. I\'m sorry I wasn\'t clearer sooner."',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.3 },
          { kind: 'blocSupport', groupId: 'faith_community',    delta:  0.2 },
          { kind: 'blocSupport', groupId: 'labor_unions',       delta: -0.1 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'spin',
        text: '"Pivot to the opponent\'s record — buy a counter-narrative ad right now."',
        effects: [
          { kind: 'cash',        amount: -600 },
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta: -0.1 },
          { kind: 'modifier', modKind: 'conversionMult', magnitude: 1.25, duration: 25 },
        ],
      },
    ],
  },

  {
    id: 'endorsement_offer',
    name: 'Endorsement Offer',
    type: 'dilemma',
    valence: 'positive',
    triggerType: 'random',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    prompt: 'A prominent community figure wants to endorse you publicly — but they want a commitment in return.',
    choices: [
      {
        id: 'accept_commit',
        text: '"You have my word. I\'ll fight for your community." (Accept with commitment)',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.4 },
          { kind: 'blocSupport', groupId: 'labor_unions',        delta:  0.3 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'accept_free',
        text: '"I appreciate the support — I\'ll do what\'s right for everyone." (Accept, no strings)',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.2 },
          { kind: 'charisma',    delta: 2 },
        ],
      },
      {
        id: 'decline',
        text: '"Thank you, but I prefer to earn endorsements through results." (Decline gracefully)',
        effects: [
          { kind: 'charisma', delta: 3 },
        ],
      },
    ],
  },

  {
    id: 'economic_report',
    name: 'Economic Report',
    type: 'dilemma',
    valence: 'neutral',
    triggerType: 'random',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    prompt: 'A new economic report just dropped — reporters are asking every candidate to react live on air.',
    choices: [
      {
        id: 'take_credit',
        text: '"These numbers show that the policies I\'ve championed are working."',
        effects: [
          { kind: 'blocSupport', groupId: 'tech_workers',        delta:  0.2 },
          { kind: 'blocSupport', groupId: 'small_business_owners', delta:  0.2 },
          { kind: 'blocSupport', groupId: 'labor_unions',         delta: -0.1 },
        ],
      },
      {
        id: 'cautious',
        text: '"We\'re making progress, but there\'s more work to do. Let\'s stay focused."',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.3 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'blame',
        text: '"These numbers would be better if the previous administration hadn\'t left such a mess."',
        effects: [
          { kind: 'blocSupport', groupId: 'labor_unions',        delta:  0.2 },
          { kind: 'blocSupport', groupId: 'civil_liberties',     delta:  0.1 },
          { kind: 'blocSupport', groupId: 'suburban_moderates',  delta: -0.2 },
        ],
      },
    ],
  },

  {
    id: 'october_surprise',
    name: 'October Surprise',
    type: 'dilemma',
    valence: 'negative',
    triggerType: 'scheduled',
    stateCheck: 'timer_late',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    prompt: 'Breaking: opposition researchers have just leaked damaging information — with less than 20 seconds until polls close. How do you respond?',
    choices: [
      {
        id: 'address',
        text: '"I\'m addressing this directly and asking voters to judge my full record."',
        effects: [
          { kind: 'blocSupport', groupId: 'suburban_moderates', delta:  0.2 },
          { kind: 'blocSupport', groupId: 'faith_community',    delta:  0.2 },
          { kind: 'charisma',    delta: 1 },
        ],
      },
      {
        id: 'turnout',
        text: '"Don\'t get distracted — get out the vote right now." (Surge GOTV effort)',
        effects: [
          { kind: 'modifier', modKind: 'conversionMult', magnitude: 1.4, duration: 30 },
        ],
      },
      {
        id: 'counter',
        text: '"Release our counter-research — go on offense immediately." (Costs cash)',
        effects: [
          { kind: 'cash',    amount: -800 },
          { kind: 'modifier', modKind: 'rivalConvMult', magnitude: 0.6, duration: 30 },
        ],
      },
    ],
  },

  // ── Modifier events (applied instantly, no player choice) ─────────────────

  {
    id: 'viral_moment',
    name: 'Viral Moment',
    type: 'modifier',
    valence: 'positive',
    triggerType: 'random',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    modKind: 'conversionMult',
    modMagnitude: 1.45,
    modDuration: 25,
  },

  {
    id: 'gaffe',
    name: 'Gaffe',
    type: 'modifier',
    valence: 'negative',
    triggerType: 'state',
    stateCheck: 'low_charisma',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    modKind: 'conversionMult',
    modMagnitude: 0.65,
    modDuration: 20,
  },

  {
    id: 'rival_scandal',
    name: 'Rival Scandal',
    type: 'modifier',
    valence: 'positive',
    triggerType: 'random',
    targetsSelf: false,  // targets a random rival
    unlockOfficeIndex: 4,
    modKind: 'rivalConvMult',
    modMagnitude: 0.55,
    modDuration: 25,
  },

  {
    id: 'grassroots_wave',
    name: 'Grassroots Wave',
    type: 'modifier',
    valence: 'positive',
    triggerType: 'state',
    stateCheck: 'high_volunteers',
    targetsSelf: true,
    unlockOfficeIndex: 4,
    modKind: 'conversionMult',
    modMagnitude: 1.5,
    modDuration: 20,
  },

  {
    id: 'donor_backlash',
    name: 'Donor Backlash',
    type: 'modifier',
    valence: 'negative',
    triggerType: 'state',
    stateCheck: 'heavy_flips',  // reuse flip check as a proxy for overuse of money
    targetsSelf: true,
    unlockOfficeIndex: 4,
    modKind: 'cashMult',
    modMagnitude: 0.6,
    modDuration: 30,
  },
];

export function getEvent(id: string): EventDef | undefined {
  return EVENTS.find(e => e.id === id);
}
