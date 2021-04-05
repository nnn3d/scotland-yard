// load env before imports
require('dotenv').config()

// eslint-disable-next-line import/first
import { createServer } from 'createServer'

run()
async function run() {
  const server = await createServer({
    host: '0.0.0.0',
    port: 4000,
  })

  await server.listen()
}
