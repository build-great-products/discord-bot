import { db } from './database.js'
import { migrateToLatest } from './migrate.js'

import { createClient } from './discord/client.js'
import { getDiscordConfig } from './env.js'

await migrateToLatest(db)

const { botToken, clientId, commandPrefix } = getDiscordConfig()

await createClient({
  db,
  botToken,
  clientId,
  commandPrefix,
})
