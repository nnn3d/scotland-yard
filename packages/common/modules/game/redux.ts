import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { extendType } from 'common/utils/extendType'
import { IdPayloadAction } from 'common/modules/redux/IdPayloadAction'
import { GameState } from 'common/modules/game/types/GameState'
import { GameStatic } from 'common/modules/game/Game'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { Ticket } from 'common/modules/game/types/Ticket'

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
  moveTo(
    game,
    {
      payload: { station, ticket },
    }: IdPayloadAction<{ station: number; ticket: Ticket }>,
  ) {
    if (!game.activePlayerCanMoveToStations[station]?.includes(ticket)) {
      return
    }

    game.activePlayer.station = station
    game.activePlayer.tickets[ticket]--

    if (game.isActivePlayerMrX) {
      game.turn.number++
    }

    if (
      game.isActivePlayerMrX &&
      game.turn.activatedDouble &&
      !game.turn.usedDouble
    ) {
      game.turn.usedDouble = true
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const player of game.players) {
      game.turn.player = game.nextActivePlayer.color

      if (game.activePlayerCanMove) {
        break
      }
    }
  },
  useDoubleTicket(game, action: IdPayloadAction) {
    if (game.activePlayer.color === MR_X_COLOR && !game.turn.activatedDouble) {
      game.turn.activatedDouble = true
    }
  },
  detectiveWins(
    game,
    { payload: { mrXStation } }: IdPayloadAction<{ mrXStation: number }>,
  ) {
    game.state.stage = 'detectivesWin'
    game.mrXPlayer.station = mrXStation
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
      load(state, { payload }: IdPayloadAction<GameState>) {
        state[payload._id] = payload
      },
      ...withGameReducers,
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
      return payload.sort((a, b) => a.createdAt - b.createdAt)
    },
    add(state, { payload }: PayloadAction<GameListItemState>) {
      state.push(payload)
      state.sort((a, b) => a.createdAt - b.createdAt)
    },
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
