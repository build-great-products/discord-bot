import { db } from './database.js'
import { migrateToLatest } from './migrate.js'

import { createClient } from './discord/client.js'
import { env } from './env.js'

await migrateToLatest(db)

await createClient({
  db,
  botToken: env.BOT_TOKEN,
  clientId: env.CLIENT_ID,
  commandPrefix: env.COMMAND_PREFIX,
})
