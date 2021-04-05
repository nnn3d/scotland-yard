import { Server, ServerOptions } from '@logux/server'
import { mongoose } from '@typegoose/typegoose'
import { dateUTCNow } from 'common/utils/dateUTCNow'
import { userModule } from 'modules/user/user.module'
import { gameModule } from 'modules/game/game.module'

export async function createServer(serverOptions?: ServerOptions) {
  // db init
  await mongoose.connect('mongodb://localhost/scotland-yard', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  process.on('SIGINT', async () => {
    await mongoose.disconnect()
    process.exit(0)
  })

  // server init
  const server = new Server(
    Server.loadOptions(process, {
      subprotocol: '1.0.0',
      supports: '1.x',
      root: __dirname,
      ...serverOptions,
    }),
  )

  server.on('preadd', (action, meta) => {
    meta.time = dateUTCNow()
  })

  userModule(server)
  gameModule(server)

  return server
}
