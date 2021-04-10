import { GameState, GamePlayerState } from 'common/modules/game/types/GameState'
import {
  PLAYER_COLORS,
  PlayerColor,
} from 'common/modules/game/types/PlayerColor'
import { STATIONS } from 'common/modules/game/constants/stations'
import { mapValues, pickBy } from 'lodash'
import {
  createUseSelector as createSelector,
  OutputSelector,
} from 'common/utils/createUseSelector'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import { BLACK_TICKET, Ticket } from 'common/modules/game/types/Ticket'

export abstract class GameBase<AppState = any> {
  protected abstract getState(appState: AppState): GameState

  protected param = <P>() => (appState: AppState, param: P) => param

  state = this.getState.bind(this)

  private playersRaw = createSelector(this.state, (state) => state.players)

  playersMap = createSelector(this.playersRaw, (players) =>
    players.reduce((playersMap, player) => {
      playersMap[player.color] = player as any
      return playersMap
    }, {} as { [Color in PlayerColor]: GamePlayerState<Color> }),
  )

  players = createSelector(this.playersMap, (playersMap) =>
    PLAYER_COLORS.map((color) => playersMap[color]).filter(Boolean),
  )

  playersNumber = createSelector(this.players, (players) => players.length)

  detectivePlayers = createSelector(this.players, (players) =>
    players.filter(({ color }) => color !== MR_X_COLOR),
  )

  mrXPlayer = createSelector(
    this.playersMap,
    (playersMap) => playersMap[MR_X_COLOR],
  )

  mrXHistory = createSelector(this.state, (state) => state.mrXHistory)

  users = createSelector(this.players, (players) =>
    players.map(({ userName }) => userName),
  )

  detectiveUsers = createSelector(this.detectivePlayers, (detectivePlayers) =>
    detectivePlayers.map(({ userName }) => userName),
  )

  mrXUser = createSelector(this.mrXPlayer, (mrXPlayer) => mrXPlayer.userName)

  turn = createSelector(this.state, (state) => state.turn)

  activePlayer = createSelector(
    this.playersMap,
    this.turn,
    (playersMap, turn) => playersMap[turn.player],
  )

  activePlayerStation = createSelector(this.activePlayer, (activePlayer) =>
    activePlayer.station ? STATIONS[activePlayer.station] : undefined,
  )

  isActivePlayerMrX = createSelector(
    this.activePlayer,
    (activePlayer) => activePlayer.color === MR_X_COLOR,
  )

  activePlayerCanMoveToStations = createSelector(
    this.activePlayer,
    this.activePlayerStation,
    this.detectivePlayers,
    this.isActivePlayerMrX,
    (player, station, detectivePlayers, isActivePlayerMrX) =>
      pickBy(
        mapValues(station?.routes || {}, (tickets) => {
          if (isActivePlayerMrX && !tickets?.includes(BLACK_TICKET)) {
            tickets?.push(BLACK_TICKET)
          }
          return tickets?.filter((ticket) => Number(player.tickets[ticket]) > 0)
        }),
        (tickets, key) =>
          tickets?.length &&
          detectivePlayers.every(
            (detective) => detective.station !== Number(key),
          ),
      ) as Record<number, Ticket[] | undefined>,
  )

  activePlayerCanMoveToStationsList = createSelector(
    this.activePlayerCanMoveToStations,
    (canMoveToStations) => Object.keys(canMoveToStations).map(Number),
  )

  activePlayerCanMove = createSelector(
    this.activePlayerCanMoveToStations,
    (canMoveToStations) => Object.keys(canMoveToStations).length > 0,
  )

  nextActivePlayer = createSelector(
    this.players,
    this.playersNumber,
    this.activePlayer,
    (players, playersNumber, activePlayer) => {
      const activePlayerIndex = players.findIndex(
        ({ color }) => color === activePlayer.color,
      )
      return players[(activePlayerIndex + 1) % players.length]
    },
  )

  stage = createSelector(this.state, (state) => state.stage)

  gameOver = createSelector(this.stage, (stage) =>
    stage === 'detectivesWin' || stage === 'mrXWin' ? stage : undefined,
  )
}

type GameSelectorKeys = {
  [K in keyof GameBase]: GameBase[K] extends OutputSelector<any, any, Function>
    ? K
    : never
}[keyof GameBase]

type GameSelectorGettersMap = {
  readonly [K in GameSelectorKeys]: ReturnType<GameBase[K]>
}

type GameData<State extends GameState> = GameSelectorGettersMap & {
  state: State
}

class GameStaticBase extends GameBase {
  constructor(protected _state: GameState) {
    super()
  }

  protected getState() {
    return this._state
  }
}

const GameStaticImpl = class GameStatic {
  constructor(public state: GameState) {
    const game = new GameStaticBase(state)

    Object.entries(game).forEach(([key, value]) => {
      if (
        typeof value === 'function' &&
        'resultFunc' in value &&
        'recomputations' in value
      ) {
        Object.defineProperty(this, key, {
          get() {
            return value.get()
          },
          configurable: true,
        })
      }
    })
  }
} as new <State extends GameState>(state: State) => GameData<State>

export class GameStatic<
  State extends GameState = GameState
> extends GameStaticImpl<State> {}
