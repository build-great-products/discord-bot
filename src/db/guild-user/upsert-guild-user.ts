import { errorBoundary } from '@stayradiated/error-boundary'

import type { GuildUser, KyselyDb, OmitTimestamps } from '../../database.js'

type UpsertGuildUserOptions = {
  db: KyselyDb
  guildUser: OmitTimestamps<GuildUser>
}

const upsertGuildUser = async (
  options: UpsertGuildUserOptions,
): Promise<GuildUser | Error> => {
  const { db, guildUser } = options

  const now = Date.now()

  const value: GuildUser = {
    ...guildUser,
    createdAt: now,
    updatedAt: now,
  }

  return errorBoundary(() =>
    db
      .insertInto('guildUser')
      .values(value)
      .onConflict((oc) =>
        oc.columns(['guildId', 'userId']).doUpdateSet({
          ...value,
          createdAt: undefined,
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow(),
  )
}

export { upsertGuildUser }
