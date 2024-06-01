import { errorBoundary } from '@stayradiated/error-boundary'

import type { GuildId, GuildUser, KyselyDb, UserId } from '../../database.js'

type GetGuildUserApiTokenOptions = {
  db: KyselyDb
  where: {
    guildId: GuildId
    userId: UserId
  }
}

const getGuildUser = async (
  options: GetGuildUserApiTokenOptions,
): Promise<GuildUser | Error> => {
  const { db, where } = options

  return errorBoundary(() =>
    db
      .selectFrom('guildUser')
      .selectAll('guildUser')
      .where('guildUser.guildId', '=', where.guildId)
      .where('guildUser.userId', '=', where.userId)
      .executeTakeFirstOrThrow(),
  )
}

export { getGuildUser }
