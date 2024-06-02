import * as process from 'node:process'
import { z } from 'zod'
import 'dotenv/config'

const $env = z.object({
  BOT_TOKEN: z.string(),
  CLIENT_ID: z.string(),
  DB_PATH: z.string().default('state.db'),
  COMMAND_PREFIX: z.string().default(''),
})

const env = $env.parse(process.env)

export { env }
