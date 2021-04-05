import { Server, Action } from '@logux/server'
import { ActionCreator, ActionCallbacks } from '@logux/server/base-server'
import { GameModel, GameDocument } from './game.schema'
import { GUEST_USER } from 'common/modules/user/redux'
import { gameUserChannel } from 'common/modules/game/channels'
import { EntityQueue } from 'modules/EntityQueue'
import { GameStatic } from 'common/modules/game/Game'

export const gameQueue = new EntityQueue()

type CtxData = { gameDoc: GameDocument; game: GameStatic<GameDocument> }

export function createGameType<S extends Server<H>, H extends object = {}>(
  server: S,
) {
  return function gameType<
    AC extends ActionCreator & {
      (...args: any): Action & {
        payload: { _id: string; [extra: string]: any }
      }
    },
    D extends object = {}
  >(
    actionCreator: AC,
    {
      access,
      resend,
      finally: finallyCallback,
      ...callbacks
    }: Partial<ActionCallbacks<ReturnType<AC>, D & CtxData, H>>,
    options: {
      resendAction?: boolean
    } = {},
  ): void {
    const { resendAction = true } = options

    server.type<AC, D & { doneTask(): void } & CtxData>(actionCreator, {
      ...callbacks,
      async access(ctx, action, meta) {
        ctx.data.doneTask = gameQueue.createTask(action.payload._id)

        if (ctx.userId === GUEST_USER) return false

        const gameDoc = await GameModel.findById(action.payload._id)

        if (!gameDoc) {
          return false
        }

        ctx.data.gameDoc = gameDoc
        ctx.data.game = new GameStatic(gameDoc)

        return access ? await access(ctx, action, meta) : true
      },
      async resend(ctx, action, meta) {
        const to = resend ? await resend(ctx, action, meta) : {}

        if (!resendAction || !ctx.data.gameDoc) return to

        const channel = gameUserChannel.link({
          id: ctx.data.gameDoc._id.toString(),
          userId: ctx.userId,
        })

        if (to.channel) {
          to.channels = [to.channel, channel]
          delete to.channel
        } else if (to.channels) {
          to.channels = to.channels.concat(channel)
        } else {
          to.channel = channel
        }

        return to
      },
      async finally(ctx, action, meta) {
        ctx.data?.doneTask()

        return finallyCallback && finallyCallback(ctx, action, meta)
      },
    })
  }
}
