import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from '@typegoose/typegoose'
import { dateUTCNow } from 'common/utils/dateUTCNow'
import {
  GAME_STAGES,
  GamePlayerState,
  GamePlayerTicketsState,
  GameStageState,
  GameState,
  GameTurnState,
} from 'common/modules/game/types/GameState'
import ObjectID from 'bson-objectid'
import {
  PLAYER_COLORS,
  PlayerColor,
} from 'common/modules/game/types/PlayerColor'
import { COMMON_TICKETS, CommonTicket } from 'common/modules/game/types/Ticket'

class GamePlayerTicketsSchema implements GamePlayerTicketsState {
  @prop({ required: true })
  taxi!: number

  @prop({ required: true })
  bus!: number

  @prop({ required: true })
  underground!: number

  @prop()
  black?: number

  @prop()
  double?: number
}

class GamePlayerSchema implements GamePlayerState {
  @prop({ required: true })
  userName!: string

  @prop({ required: true, enum: PLAYER_COLORS })
  color!: PlayerColor

  @prop({ required: true })
  station!: number

  @prop()
  lastStation?: number

  @prop({ required: true, type: GamePlayerTicketsSchema })
  tickets!: GamePlayerTicketsState
}

class GameTurnSchema implements GameTurnState {
  @prop({ required: true })
  number!: number

  @prop({ required: true, type: String, enum: PLAYER_COLORS })
  player!: PlayerColor

  @prop()
  activatedDouble?: boolean

  @prop()
  usedDouble?: boolean
}

@modelOptions({
  options: {
    customName: 'Game',
    allowMixed: Severity.ERROR,
  },
  schemaOptions: {
    timestamps: {
      currentTime: dateUTCNow,
    },
  },
})
export class GameSchema implements GameState {
  _id!: ObjectID

  @prop({ required: true })
  name!: string

  @prop({ required: true })
  ownerName!: string

  @prop({ required: true, type: GamePlayerSchema })
  players!: GamePlayerState[]

  @prop({ required: true, type: String, enum: COMMON_TICKETS })
  mrXHistory!: CommonTicket[]

  @prop({ required: true, type: GameTurnSchema })
  turn!: GameTurnState

  @prop({ required: true, type: String, enum: GAME_STAGES })
  stage!: GameStageState

  @prop({ expires: '10d' })
  createdAt!: number

  @prop({ expires: '1d' })
  updatedAt!: number

  @prop({ expires: '1h' })
  finishedAt!: number

  toObject!: () => GameObject
}

export type GameDocument = Omit<DocumentType<GameSchema>, 'toObject'> & {
  toObject: () => GameObject
}

export type GameObject = Omit<GameDocument, '_id'> & { _id: string }

export const GameModel = getModelForClass(GameSchema)
