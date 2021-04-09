import { Server } from '@logux/server'
import { UserDocument, UserModel } from 'modules/user/user.schema'
import { RouteParams } from 'common/utils/createRoute'
import { GameModel, GameDocument, GameObject } from 'modules/game/game.schema'
import {
  gameUserChannel,
  gameDetectivesChannel,
  gameListChannel,
} from 'common/modules/game/channels'
import { GUEST_USER } from 'common/modules/user/redux'
import { createGameType, gameQueue } from 'modules/game/createGameType'
import {
  gameActions,
  gameListActions,
  GameListItemState,
  gameUpdaters,
  newGameDataActions,
} from 'common/modules/game/redux'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import {
  ChannelCallbacks,
  LoguxSubscribeAction,
} from '@logux/server/base-server'
import { createGameState } from 'modules/game/createGameState'
import { GameStatic } from 'common/modules/game/Game'
import { loginValidator } from 'common/modules/user/validators'
import { GAME_CONFIG } from 'common/modules/game/constants/gameConfig'

function gameDocToGameListItem(gameDoc: GameDocument): GameListItemState {
  const gameObj = gameDoc.toObject()

  return {
    id: gameObj._id,
    name: gameObj.name,
    ownerName: gameObj.ownerName,
    players: gameObj.players.map(({ userName }) => userName),
    createdAt: gameDoc.createdAt,
  }
}

function removeMrXSecretData(gameObj: GameObject): GameObject {
  return {
    ...gameObj,
    players: gameObj.players.map((player) => ({
      ...player,
      ...(player.color === MR_X_COLOR && { station: undefined }),
    })),
  }
}

export function gameModule(server: Server) {
  server.channel(gameListChannel.path, {
    async access({ userId }) {
      return userId !== GUEST_USER
    },
    async load(ctx) {
      const userGames = await GameModel.find({
        'players.userName': ctx.userId,
      }).exec()

      await ctx.sendBack(
        gameListActions.load(
          userGames
            .filter((gameDoc) => gameDoc.stage === 'inProgress')
            .map(gameDocToGameListItem),
        ),
      )
    },
  })

  server.type(newGameDataActions.change, {
    access({ userId }) {
      return userId !== GUEST_USER
    },
    async process(ctx, { payload: { name, number } }) {
      if (loginValidator(name)) {
        return
      }

      const userDocs = await UserModel.find({
        login: new RegExp(name.toLowerCase()),
      })
        .limit(10)
        .exec()

      await ctx.sendBack(
        newGameDataActions.setCompletions({
          number,
          name,
          completions: userDocs.map((userDoc) => userDoc.login),
        }),
      )
    },
  })

  server.channel<
    RouteParams<typeof gameUserChannel>,
    { game: GameStatic<GameObject> }
  >(gameUserChannel.path, createCallbacksForGameChannel(false))

  server.channel<
    RouteParams<typeof gameDetectivesChannel>,
    { game: GameStatic<GameObject> }
  >(gameDetectivesChannel.path, createCallbacksForGameChannel(true))

  function createCallbacksForGameChannel(
    isDetectives: boolean,
  ): ChannelCallbacks<
    LoguxSubscribeAction,
    { game: GameStatic<GameObject> },
    { id: string; userId?: string },
    any
  > {
    return {
      async access({ data, params, userId }) {
        if (
          userId === GUEST_USER ||
          (!isDetectives && params.userId !== userId)
        ) {
          return false
        }

        await gameQueue.waitCurrentTasks(params.id)

        const gameDoc: GameDocument | null = await GameModel.findById(
          params.id,
        ).exec()

        if (gameDoc) {
          data.game = new GameStatic(gameDoc.toObject())

          return isDetectives
            ? data.game.state.ownerName === userId
            : data.game.users.includes(userId)
        } else {
          return false
        }
      },
      async load(ctx) {
        const gameObjForMrX: GameObject = ctx.data.game.state

        const gameObjForDetectives: GameObject = removeMrXSecretData(
          gameObjForMrX,
        )

        if (
          isDetectives ||
          Object.values(gameObjForMrX.players).find(
            (player) => player.userName === ctx.userId,
          )?.color !== MR_X_COLOR
        ) {
          await ctx.sendBack(gameActions.load(gameObjForDetectives))
        } else {
          await ctx.sendBack(gameActions.load(gameObjForMrX))
        }
      },
    }
  }

  server.type<typeof gameActions.createGame, { userDoc: UserDocument }>(
    gameActions.createGame,
    {
      async access({ data, userId }, { payload }) {
        if (userId === GUEST_USER) return false

        const userDoc = await UserModel.findByLogin(userId)
        if (userDoc) {
          data.userDoc = userDoc
          return Boolean(Object.values(payload.players).includes(userDoc.login))
        } else {
          return false
        }
      },
      async process({ data }, { payload }, meta) {
        const gameState = createGameState({
          ...payload,
          userDoc: data.userDoc,
        })

        if (!gameState) {
          server.undo(meta)
          return
        }

        const gameDoc = (await new GameModel(gameState).save()) as GameDocument

        const game = new GameStatic(gameDoc)

        await server.process(
          gameListActions.add(gameDocToGameListItem(game.state)),
          {
            status: 'processed',
            users: game.users,
          },
        )
      },
    },
  )

  const gameType = createGameType(server)

  gameType(gameActions.useDoubleTicket, {
    process(ctx, action, meta) {
      const game = ctx.data.game

      gameUpdaters.useDoubleTicket(game, action)
    },
    resend(ctx, action, meta) {
      return { channels: ctx.data.game.playerChannels }
    },
  })

  gameType<typeof gameActions.moveTo, { isMrX?: boolean }>(gameActions.moveTo, {
    process(ctx, action, meta) {
      const { payload } = action
      const game = ctx.data.game
      const movedPlayer = game.activePlayer
      const isMrX = game.isActivePlayerMrX

      gameUpdaters.moveTo(game, action)

      const lastMrXStationAction = gameActions.setMrXLastStation(payload)

      if (game.gameOver) {
        ctx.data.process(lastMrXStationAction, {
          channels: game.detectiveChannels,
        })
      }

      if (isMrX) {
        const isDisclosureTurn = GAME_CONFIG.disclosureMrXTurns.includes(
          game.turn.number,
        )
        const actionForDetecrives = {
          ...action,
          payload: { ...payload, station: undefined },
        }

        ctx.data.process(actionForDetecrives, {
          channels: game.detectiveChannels,
        })
        if (isDisclosureTurn) {
          gameUpdaters.setMrXLastStation(game, lastMrXStationAction)
          ctx.data.process(lastMrXStationAction, {
            channels: game.detectiveChannels,
          })
        }
      } else {
        if (movedPlayer.station === game.mrXPlayer.station) {
          const winAction = gameActions.detectiveWins({
            mrXStation: Number(game.mrXPlayer.station),
            _id: game.id,
          })
          gameUpdaters.detectiveWins(game, winAction)
          ctx.data.process(winAction, {
            channels: game.playerChannels,
          })
        }
      }
    },
    resend(ctx, action, meta) {
      if (typeof ctx.data.isMrX === 'undefined') {
        ctx.data.isMrX = ctx.data.game.isActivePlayerMrX
      }
      if (!ctx.data.isMrX) {
        return { channels: ctx.data.game.detectiveUsers }
      }
      return {}
    },
  })

  gameType(
    gameActions.delete,
    {
      access(ctx) {
        return ctx.data.game.state.ownerName === ctx.userId
      },
      async process(ctx) {
        await GameModel.findByIdAndDelete(ctx.data.game.state._id)
      },
      resend(ctx) {
        return { channels: ctx.data.game.playerChannels }
      },
    },
    { save: false },
  )
}
