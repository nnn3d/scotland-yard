import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { extendType } from 'common/utils/extendType'
import { IdPayloadAction } from 'common/modules/redux/IdPayloadAction'
import { GameState } from 'common/modules/game/types/GameState'
import { GameStatic } from 'common/modules/game/Game'
import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { Ticket } from 'common/modules/game/types/Ticket'
import { GAME_CONFIG } from 'common/modules/game/constants/gameConfig'

type WithGameReducer<Action extends IdPayloadAction> = (
  this: void,
  game: GameStatic,
  action: Action,
) => void

export const gameUpdaters = extendType<
  Record<string, WithGameReducer<IdPayloadAction<any>>>
>()({
  setStartPositions(
    game,
    {
      payload: { positions },
    }: IdPayloadAction<{
      positions: Array<{ color: PlayerColor; station: number }>
    }>,
  ) {
    positions.forEach(({ color, station }) => {
      game.playersMap[color].station = station
    })
  },
  mrXMoveTo(
    game,
    {
      payload: { station, ticket },
    }: IdPayloadAction<{ station?: number; ticket: Ticket }>,
  ) {
    const hasStation = station != null
    if (
      game.state.stage !== 'inProgress' ||
      (station != null
        ? !game.activePlayerCanMoveToStations[station]?.includes(ticket)
        : !game.isActivePlayerMrX)
    ) {
      return
    }

    if (hasStation) game.activePlayer.station = station
    game.activePlayer.tickets[ticket]--

    if (game.isActivePlayerMrX) {
      game.turn.number++
      game.mrXHistory.push(ticket)
      if (game.turn.number >= GAME_CONFIG.numberOfTurns) {
        game.state.stage = 'mrXWin'
        return
      }

      if (game.turn.activatedDouble && !game.turn.usedDouble) {
        game.turn.usedDouble = true
        return
      }

      game.turn.activatedDouble = false
      game.turn.usedDouble = false
    } else {
      game.mrXPlayer.tickets[ticket]++
    }

    const currentPlayer = game.activePlayer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const player of game.players) {
      game.turn.player = game.nextActivePlayer.color

      if (game.activePlayerCanMove || game.isActivePlayerMrX) {
        break
      }
    }

    if (
      !game.activePlayerCanMove ||
      (currentPlayer === game.activePlayer && game.isActivePlayerMrX)
    ) {
      game.state.stage = 'mrXWin'
    }
  },
  moveTo(game, action: IdPayloadAction<{ station: number; ticket: Ticket }>) {
    gameUpdaters.mrXMoveTo(game, action)
  },
  useDoubleTicket(game, action: IdPayloadAction) {
    if (
      game.isActivePlayerMrX &&
      !game.turn.activatedDouble &&
      game.mrXPlayer.tickets.double
    ) {
      game.turn.activatedDouble = true
      game.mrXPlayer.tickets.double--
    }
  },
  setMrXLastStation(
    game,
    { payload: { station } }: IdPayloadAction<{ station: number }>,
  ) {
    game.mrXPlayer.lastStation = station
  },
  detectiveWins(
    game,
    { payload: { mrXStation } }: IdPayloadAction<{ mrXStation: number }>,
  ) {
    game.state.stage = 'detectivesWin'
    game.mrXPlayer.lastStation = mrXStation
  },
})

type GameUpdaters = typeof gameUpdaters

const withGame = <Action extends IdPayloadAction>(
  withGameReducer: WithGameReducer<Action>,
) => (state: ReducerState, action: Action) => {
  const gameState = state[action.payload._id]

  if (gameState) {
    withGameReducer(new GameStatic(gameState), action)
  }
}

type ReducerState = Record<string, GameState | undefined>

type WithGame<GameUpdater extends WithGameReducer<any>> = (
  state: ReducerState,
  action: GameUpdater extends WithGameReducer<infer Action> ? Action : never,
) => void

const withGameReducers = {} as {
  [K in keyof GameUpdaters]: WithGame<GameUpdaters[K]>
}
;(Object.keys(gameUpdaters) as (keyof GameUpdaters)[]).forEach((key) => {
  withGameReducers[key] = withGame(gameUpdaters[key] as WithGameReducer<any>)
})

export const { actions: gameClientActions, reducer: gameReducer } = createSlice(
  {
    name: 'game',
    initialState: {} as ReducerState,
    reducers: {
      ...withGameReducers,
      load(state, { payload }: IdPayloadAction<GameState>) {
        state[payload._id] = payload
      },
      delete(state, { payload: { _id } }: IdPayloadAction) {
        delete state[_id]
      },
    },
  },
)

const gameServerActions = {
  createGame: createAction<{ name: string; players: { [k: string]: string } }>(
    'game/createGame',
  ),
}

export const gameActions = {
  ...gameClientActions,
  ...gameServerActions,
}

export type GameListItemState = {
  id: string
  name: string
  ownerName: string
  createdAt: number
  players: string[]
}

export type GameListState = Array<GameListItemState>

export const {
  actions: gameListActions,
  reducer: gameListReducer,
} = createSlice({
  name: 'gameList',
  initialState: [] as GameListState,
  reducers: {
    load(state, { payload }: PayloadAction<GameListState>) {
      return payload.sort((a, b) => b.createdAt - a.createdAt)
    },
    add(state, { payload }: PayloadAction<GameListItemState>) {
      state.push(payload)
      state.sort((a, b) => b.createdAt - a.createdAt)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(gameActions.delete, (state, { payload }) => {
      const gameIndex = state.findIndex((game) => game.id === payload._id)
      if (gameIndex >= 0) {
        state.splice(gameIndex, 1)
      }
    })
  },
})

type NewGamePlayerState = {
  name: string
  completions: string[]
}

export const {
  reducer: newGameDataReducer,
  actions: newGameDataActions,
} = createSlice({
  name: 'newGameData',
  initialState: {
    players: {} as Record<number, NewGamePlayerState | undefined>,
  },
  reducers: {
    change(
      state,
      {
        payload: { number, name },
      }: PayloadAction<{ number: number; name: string }>,
    ) {
      state.players[number] = { name, completions: [] }
    },
    clear() {
      return { mrXPlayer: undefined, players: {} }
    },
    setCompletions(
      state,
      {
        payload: { number, name, completions },
      }: PayloadAction<{ number: number; name: string; completions: string[] }>,
    ) {
      const item = state.players[number]
      if (item?.name === name) {
        item.completions = completions
      }
    },
  },
})
