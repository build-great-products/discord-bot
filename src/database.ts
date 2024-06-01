import SqliteDatabase from 'better-sqlite3'
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely'

type GuildId = string & { __brand: 'guildId' }
type UserId = string & { __brand: 'userId' }

type OmitTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>

type Guild = {
  id: GuildId
  roughWorkspaceId: string
  roughWorkspacePublicId: string
  apiToken: string
  name: string
  createdAt: number
  updatedAt: number
}

type GuildUser = {
  guildId: GuildId
  userId: UserId
  roughUserId: string
  name: string
  createdAt: number
  updatedAt: number
}

type Database = {
  guild: Guild
  guildUser: GuildUser
}

type KyselyDb = Kysely<Database>

const db: KyselyDb = new Kysely({
  dialect: new SqliteDialect({
    database: async () => new SqliteDatabase('state.db'),
  }),
  plugins: [new CamelCasePlugin()],
})

export type {
  OmitTimestamps,
  GuildId,
  UserId,
  Database,
  Guild,
  GuildUser,
  KyselyDb,
}
export { db }
