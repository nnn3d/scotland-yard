import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { WhenMrX } from 'common/modules/game/types/MrX'
import { CommonTicket, MrXTicket } from 'common/modules/game/types/Ticket'

export type GameState = {
  name: string
  ownerName: string
  players: Players
  turn: GameTurnState
  mrXHistory: CommonTicket[]
  stage: GameStageState
}

export const GAME_STAGES = ['inProgress', 'mrXWin', 'detectivesWin'] as const

export type GameStageState = typeof GAME_STAGES[number]

export type GameTurnState = {
  number: number
  player: PlayerColor
  activatedDouble?: boolean
  usedDouble?: boolean
}

export type GamePlayerState<Color extends PlayerColor = PlayerColor> = {
  userName: string
  color: Color
  station: WhenMrX<Color, number | undefined, number>
  tickets: Record<CommonTicket, number> &
    WhenMrX<
      Color,
      Record<MrXTicket, number>,
      { [K in Exclude<MrXTicket, CommonTicket>]?: number }
    >
}

export type GamePlayerTicketsState = Record<CommonTicket, number> &
  { [K in Exclude<MrXTicket, CommonTicket>]?: number }

type Players = Array<GamePlayerState>
