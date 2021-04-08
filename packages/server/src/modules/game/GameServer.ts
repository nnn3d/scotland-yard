import { GameStatic } from 'common/modules/game/Game'
import { GameDocument, GameObject } from 'modules/game/game.schema'
import {
  gameDetectivesChannel,
  gameUserChannel,
} from 'common/modules/game/channels'

export class GameServer<
  State extends GameDocument | GameObject = GameDocument | GameObject
> extends GameStatic<State> {
  get id() {
    return this.state._id.toString()
  }

  get detectiveChannels() {
    return this.detectiveUsers
      .map((userId) => gameUserChannel.link({ id: this.id, userId }))
      .concat(gameDetectivesChannel.link({ id: this.id }))
  }

  get mrXChannel() {
    return gameUserChannel.link({ id: this.id, userId: this.mrXUser })
  }

  get playerChannels() {
    return this.detectiveChannels.concat(this.mrXChannel)
  }
}
