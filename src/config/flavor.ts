// Flavor / narrative content — Veep-gentle × The Onion tone.
// All copy lives here; components import and display, never hardcode strings.

// ---------------------------------------------------------------------------
// Office title cards — shown in ResultModal on general-election wins
// ---------------------------------------------------------------------------

export interface OfficeTitleCard {
  tagline: string;
  quote: string;
}

export const OFFICE_TITLE_CARDS: Record<string, OfficeTitleCard> = {
  city_council: {
    tagline: 'Every dynasty starts with a folding table and a clipboard.',
    quote: 'You now represent a district of 8,000 people, each with a very specific complaint about garbage pickup.',
  },
  mayor: {
    tagline: 'Now they have to return your calls.',
    quote: 'The city\'s potholes, the 911 hold times, and a very contentious dog park are now officially your fault.',
  },
  county_council: {
    tagline: 'A bigger pond. Roughly the same frogs.',
    quote: 'You represent 47 distinct communities, each convinced the county is ignoring them specifically.',
  },
  county_executive: {
    tagline: 'The buck stops closer.',
    quote: 'You have a budget, a staff of twelve, and strong opinions about regional transit that nobody asked for.',
  },
  state_legislature: {
    tagline: 'Welcome to the capitol.',
    quote: 'You\'ve been assigned a bronze nameplate, a shared parking spot, and 847 votes on agricultural tax credits.',
  },
  governor: {
    tagline: 'The whole state is watching.',
    quote: 'Your face will appear on a highway sign. This is non-negotiable.',
  },
  senate: {
    tagline: "The world's most deliberative body. Your mileage may vary.",
    quote: 'You have been given a six-year term, a hearing room, and approximately eleven minutes of floor time per quarter.',
  },
  president: {
    tagline: 'This is what you came for.',
    quote: 'The motorcade is impressive. The briefings are not.',
  },
};

// ---------------------------------------------------------------------------
// Rival archetype bios — one-liner shown in the race header
// ---------------------------------------------------------------------------

export const ARCHETYPE_BIOS: Record<string, string> = {
  career_politician:    'Has been running for something since sophomore class president. Nobody is sure what they actually believe.',
  establishment_favorite: 'Endorsed by everyone who matters and several people who don\'t. Their logo is a very reassuring shade of blue.',
  radical_insurgent:    'Convinced that half-measures are why nothing ever changes, and that you are a half-measure.',
  charismatic_outsider: 'Never held office, never had a bad hair day, and somehow polling at 22%.',
  self_funding_mogul:   'Can afford to lose. Finds this relaxing.',
  single_issue_crusader:'Has one issue. Is not interested in your other issues.',
};

// ---------------------------------------------------------------------------
// News ticker lines — ambient flavor scrolling during elections, by era
// ---------------------------------------------------------------------------

export const TICKER_LINES: Record<string, string[]> = {
  local: [
    'Local candidate makes impassioned speech to crowd of eleven, including two dogs',
    'City hall meeting runs 45 minutes over; attendees debate whether to blame the mayor or the audio system',
    'Polling shows race "too close to call," which the trailing candidate immediately quotes as a moral victory',
    'New yard sign spotted; neighborhood association confirms it does not comply with sign ordinance',
    'Campaign volunteer reports "great energy on the doors" despite eleven consecutive rejections',
    'Incumbent cites "strong vision for the future" without specifying which future',
    'Rival campaign releases strongly-worded op-ed; rival campaign disputes characterization as strongly-worded',
    'Local paper endorses candidate in editorial that also calls for more bike lanes',
  ],
  county: [
    'County candidate proposes bold infrastructure plan costing twice the county\'s annual budget',
    'Debate audience described as "engaged" by organizers; three attendees were visibly asleep',
    'Polling firm releases results with a margin of error larger than the stated lead',
    'Major donor described as "enthusiastically neutral" pending further conversations',
    'Campaign bus breaks down en route to fundraiser; candidate pivots to "authentic moment"',
    'Regional newspaper endorses candidate; newspaper has 4,200 print subscribers and a strong coupon section',
    'Both candidates claim to be the real outsider; both have held office for a combined 22 years',
    'Candidates agree the county deserves better; disagree on literally everything else',
  ],
  state: [
    'Candidate\'s TV ad called "compelling" by focus group of six people in a strip mall conference room',
    'Overnight poll shows seven-point swing; overnight poll quietly retracted by morning',
    'State Party is "monitoring the race closely," which everyone agrees means something',
    'Celebrity surrogate endorses candidate; asks staff afterward who the candidate is',
    'Opposition research team releases 40-page document; journalists read pages 1, 7, and 38',
    'National party sends "helpful memo"; campaign thanks them and files it in the recycling bin',
    'Candidate skips state fair despite strong corn dog polling numbers',
    'Governor\'s race called "a test of the national mood"; national mood unavailable for comment',
  ],
  federal: [
    'National pundit calls race a "referendum on everything"; opponent calls it a "referendum on something else"',
    'Cable news declares the state "in play" for the fourteenth consecutive election cycle',
    '$50 million in attack ads have aired this cycle; voters describe them as "somewhat annoying"',
    'Candidate\'s book climbs to #4 on bestseller list, purchased primarily by donors seeking shelf photos',
    'Debate prep leak confirms candidate is "very prepared and also absolutely terrified"',
    'Seven Electoral College votes remain genuinely undecided; anchors treat this as a medical emergency',
    'Former official\'s endorsement described as "complicated" by campaign manager, who then stops taking calls',
    'Campaign promises a "new direction"; new direction polls at 51% favorable, 49% unfavorable, ±3 points',
  ],
};
