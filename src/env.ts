import * as process from 'node:process'
import memoize from 'memoize'
import { z } from 'zod'
import 'dotenv/config'

const getDbPath = memoize(() => {
  const $env = z.object({
    DB_PATH: z.string().default('state.db'),
  })
  return $env.parse(process.env).DB_PATH
})

const getDiscordConfig = memoize(() => {
  const $env = z.object({
    BOT_TOKEN: z.string(),
    CLIENT_ID: z.string(),
    COMMAND_PREFIX: z.string().default(''),
  })
  const env = $env.parse(process.env)
  return {
    botToken: env.BOT_TOKEN,
    clientId: env.CLIENT_ID,
    commandPrefix: env.COMMAND_PREFIX,
  }
})

const getRoughAppUrl = memoize(() => {
  const $env = z.object({
    ROUGH_APP_URL: z.string().default('https://in.rough.app'),
  })
  return $env.parse(process.env).ROUGH_APP_URL
})

export { getDbPath, getDiscordConfig, getRoughAppUrl }
