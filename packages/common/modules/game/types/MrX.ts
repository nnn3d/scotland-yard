import { PlayerColor } from 'common/modules/game/types/PlayerColor'

export const MR_X_COLOR = 'white'
export type MrXColor = typeof MR_X_COLOR

export type WhenMrX<
  Color extends PlayerColor,
  WhenTrue,
  WhenFalse
> = Color extends MrXColor ? WhenTrue : WhenFalse
