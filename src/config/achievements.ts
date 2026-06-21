import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first election.',
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Win 3 elections in a single run.',
  },
  {
    id: 'dynasty_begins',
    name: 'Dynasty Begins',
    description: 'Complete your first run reset (win or loss).',
  },
  {
    id: 'landslide',
    name: 'Landslide',
    description: 'Win an election with over 75% of the vote.',
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Reach County Executive on any run.',
  },
  {
    id: 'statesman',
    name: 'Statesman',
    description: 'Reach State Legislature on any run.',
  },
  {
    id: 'perk_up',
    name: 'Perk Up',
    description: 'Buy your first prestige perk.',
  },
  {
    id: 'power_broker',
    name: 'Power Broker',
    description: 'Own 5 or more prestige perks.',
  },
  {
    id: 'the_kingmaker',
    name: 'The Kingmaker',
    description: 'Unlock the Kingmaker perk.',
  },
  {
    id: 'the_long_game',
    name: 'The Long Game',
    description: 'Win the Presidency and complete a full run.',
  },
];
