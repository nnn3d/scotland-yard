import { Server, Action } from '@logux/server'
import { ActionCreator, ActionCallbacks } from '@logux/server/base-server'
import { GameModel, GameDocument } from './game.schema'
import { GUEST_USER } from 'common/modules/user/redux'
import { EntityQueue } from 'modules/EntityQueue'
import { GameServer } from 'modules/game/GameServer'

export const gameQueue = new EntityQueue()

type CtxData = { gameDoc: GameDocument; game: GameServer }

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
      process,
      finally: finallyCallback,
      ...callbacks
    }: Partial<ActionCallbacks<ReturnType<AC>, D & CtxData, H>>,
    { save = true }: { save?: boolean } = {},
  ): void {
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
        ctx.data.game = new GameServer(gameDoc)

        return access ? await access(ctx, action, meta) : true
      },
      async process(ctx, action, meta) {
        await process?.(ctx, action, meta)
        if (save) {
          await ctx.data.gameDoc.save()
        }
      },
      async finally(ctx, action, meta) {
        if (ctx.data.doneTask) {
          ctx.data.doneTask()
        }

        return finallyCallback && finallyCallback(ctx, action, meta)
      },
    })
  }
}
