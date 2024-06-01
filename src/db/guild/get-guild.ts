import { errorBoundary } from '@stayradiated/error-boundary'

import type { Guild, GuildId, KyselyDb } from '../../database.js'

type GetGuildApiTokenOptions = {
  db: KyselyDb
  where: {
    guildId: GuildId
  }
}

const getGuild = async (
  options: GetGuildApiTokenOptions,
): Promise<Guild | Error> => {
  const { db, where } = options

  return errorBoundary(() =>
    db
      .selectFrom('guild')
      .selectAll('guild')
      .where('guild.id', '=', where.guildId)
      .executeTakeFirstOrThrow(),
  )
}

export { getGuild }
