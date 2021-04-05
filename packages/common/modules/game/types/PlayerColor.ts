import { MR_X_COLOR } from 'common/modules/game/types/MrX'

export const DETECTIVE_COLORS = [
  'black',
  'red',
  'blue',
  'yellow',
  'green',
] as const
export type DetectiveColor = typeof DETECTIVE_COLORS[number]

// order is important
export const PLAYER_COLORS = [MR_X_COLOR, ...DETECTIVE_COLORS] as const
export type PlayerColor = typeof PLAYER_COLORS[number]
