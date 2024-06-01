import { errorBoundary } from '@stayradiated/error-boundary'

import type { Guild, KyselyDb, OmitTimestamps } from '../../database.js'

type UpsertGuildOptions = {
  db: KyselyDb
  guild: OmitTimestamps<Guild>
}

const upsertGuild = async (
  options: UpsertGuildOptions,
): Promise<Guild | Error> => {
  const { db, guild } = options

  const now = Date.now()

  const value: Guild = {
    ...guild,
    createdAt: now,
    updatedAt: now,
  }

  return errorBoundary(() =>
    db
      .insertInto('guild')
      .values(value)
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          ...value,
          createdAt: undefined,
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow(),
  )
}

export { upsertGuild }
