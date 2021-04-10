import { GameBase } from 'common/modules/game/Game'
import { AppState } from 'redux/configureStore'
import { gameActions } from 'common/modules/game/redux'
import { AnyAction } from '@logux/core'
import { LoguxDispatch } from '@logux/redux/create-logux-creator'
import { useUserId } from 'hooks/useUserId'
import { GamePlayerState, GameState } from 'common/modules/game/types/GameState'
import EventEmitter from 'eventemitter3'
import { PropsList as MapProps } from 'react-zoom-pan-pinch/dist/store/interfaces/propsInterface'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import { useIsDetectivesMap } from 'pages/GamePage/components/GameContext'

type GameActions = typeof gameActions

type GameActionsWithId = {
  [K in keyof GameActions]: { _id: string } extends Parameters<
    GameActions[K]
  >[0]
    ? () => ReturnType<GameActions[K]>
    : (
        p: Omit<Parameters<GameActions[K]>[0], '_id'>,
      ) => ReturnType<GameActions[K]>
}

export type MapState = {
  previousScale: number
  scale: number
  positionX: number
  positionY: number
}

export type MapHandlerState = MapState & MapProps

export type MapEventNames =
  | 'panning'
  | 'panningStart'
  | 'panningStop'
  | 'pinching'
  | 'pinchingStart'
  | 'pinchingStop'
  | 'wheel'
  | 'wheelStart'
  | 'wheelStop'
  | 'zoomChange'

export class GameRedux extends GameBase<AppState> {
  readonly actions: GameActionsWithId

  readonly map = new EventEmitter<Record<MapEventNames, [MapHandlerState]>>()

  createMapPropHandler = (name: MapEventNames) => (data: MapHandlerState) => {
    this.map.emit(name, data)
  }

  readonly mapComponentHandlers = {
    onPanning: this.createMapPropHandler('panning'),
    onPanningStart: this.createMapPropHandler('panningStart'),
    onPanningStop: this.createMapPropHandler('panningStop'),
    onPinching: this.createMapPropHandler('pinching'),
    onPinchingStart: this.createMapPropHandler('pinchingStart'),
    onPinchingStop: this.createMapPropHandler('pinchingStop'),
    onWheel: this.createMapPropHandler('wheel'),
    onWheelStart: this.createMapPropHandler('wheelStart'),
    onWheelStop: this.createMapPropHandler('wheelStop'),
    onZoomChange: this.createMapPropHandler('zoomChange'),
  } as const

  constructor(public readonly id: string, dispatch: LoguxDispatch<AnyAction>) {
    super()

    this.actions = {} as GameActionsWithId
    ;(Object.keys(gameActions) as Array<keyof GameActions>).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.actions[key] = ((payload: any) =>
        dispatch.sync(
          gameActions[key](
            Array.isArray(payload) ? payload : { ...payload, _id: this.id },
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )) as any
    })
  }

  protected getState(appState: AppState) {
    return appState.game[this.id] as GameState
  }

  useIsCurrentUserMrX = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const userId = useUserId()
    const mrXPlayer = this.mrXPlayer.use()
    return userId === mrXPlayer.userName
  }

  useCurrentUserPlayer = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const userId = useUserId()
    const players = this.players.use()
    return players.find(
      ({ userName }) => userName === userId,
    ) as GamePlayerState
  }

  useIsCurrentUserActivePlayer = () => {
    const activePlayer = this.activePlayer.use()
    const canMove = this.activePlayerCanMove.use()
    const gameOver = this.gameOver.use()
    const userPlayer = this.useCurrentUserPlayer()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isDetectivesMap = useIsDetectivesMap()

    return (
      !gameOver &&
      (isDetectivesMap
        ? activePlayer.color !== MR_X_COLOR
        : activePlayer === userPlayer) &&
      canMove
    )
  }
}
