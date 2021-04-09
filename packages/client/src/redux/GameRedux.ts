import { GameBase } from 'common/modules/game/Game'
import { AppState } from 'redux/configureStore'
import { gameActions } from 'common/modules/game/redux'
import { AnyAction } from '@logux/core'
import { LoguxDispatch } from '@logux/redux/create-logux-creator'
import { useUserId } from 'hooks/useUserId'
import { GamePlayerState, GameState } from 'common/modules/game/types/GameState'

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

export class GameRedux extends GameBase<AppState> {
  readonly actions: GameActionsWithId

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

  useIsCurrentUserActivePlayer = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const userId = useUserId()
    const activePlayer = this.activePlayer.use()
    return activePlayer.userName === userId
  }

  useCurrentUserPlayer = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const userId = useUserId()
    const players = this.players.use()
    return players.find(
      ({ userName }) => userName === userId,
    ) as GamePlayerState
  }
}
