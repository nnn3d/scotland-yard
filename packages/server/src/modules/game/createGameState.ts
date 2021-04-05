import { GameState } from 'common/modules/game/types/GameState'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import {
  PLAYER_COLORS,
  PlayerColor,
} from 'common/modules/game/types/PlayerColor'
import { GAME_CONFIG } from 'common/modules/game/constants/gameConfig'
import { UserDocument } from 'modules/user/user.schema'
import { START_STATIONS } from 'common/modules/game/constants/startStations'
import { validateGameName } from 'common/modules/game/validators'

export function createGameState({
  name,
  userDoc,
  players,
}: {
  name: string
  userDoc: UserDocument
  players: {
    [k: string]: string
  }
}): GameState | undefined {
  const playersList = Object.values(players)

  if (
    !players[MR_X_COLOR] ||
    !playersList.includes(userDoc.login) ||
    new Set(playersList).size !== playersList.length ||
    validateGameName(name)
  ) {
    return undefined
  }

  const startStations = [...START_STATIONS]

  return {
    name,
    ownerName: userDoc.login,
    turn: {
      number: 0,
      player: 'white',
    },
    stage: 'inProgress',
    mrXHistory: [],
    players: (Object.entries(players).filter(([color]) =>
      PLAYER_COLORS.includes(color as PlayerColor),
    ) as [PlayerColor, string][]).map(
      ([color, userName], index, playerList) => {
        const stationIndex = Math.floor(Math.random() * startStations.length)
        const [station] = startStations.splice(stationIndex, 1)

        if (color === MR_X_COLOR) {
          return {
            userName,
            color,
            tickets: {
              ...GAME_CONFIG.mrXStartTickets,
              black: Object.keys(players).length - 1,
            },
            station,
          }
        } else {
          return {
            userName,
            color,
            tickets: {
              ...GAME_CONFIG.detectiveStartTickets,
            },
            station,
          }
        }
      },
    ),
  }
}
