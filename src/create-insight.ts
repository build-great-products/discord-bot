import type { GuildId, KyselyDb, UserId } from './database.js'

import { getGuildUser } from './db/guild-user/get-guild-user.js'
import { getGuild } from './db/guild/get-guild.js'
import * as roughApi from './rough-api/index.js'

import {
  failure,
  guildNotConnectedReply,
  userNotIdentifiedReply,
} from './discord-utils.js'
import type { Reply } from './discord-utils.js'

type CreateInsightOptions = {
  db: KyselyDb
  guildId: GuildId
  userId: UserId
  title?: string
  content: string
  responseMode?: 'only-error' | 'full'
}

const createInsight = async (
  options: CreateInsightOptions,
): Promise<Reply | undefined> => {
  const {
    db,
    guildId,
    userId,
    title = 'Discord Insight',
    content,
    responseMode = 'full',
  } = options

  const guild = await getGuild({ db, where: { guildId } })
  if (guild instanceof Error) {
    return guildNotConnectedReply
  }

  const apiToken = guild.apiToken

  const guildUser = await getGuildUser({ db, where: { guildId, userId } })
  if (guildUser instanceof Error) {
    return userNotIdentifiedReply
  }

  const note = await roughApi.createNote({
    apiToken,
    title,
    content,
    createdByUserId: guildUser.roughUserId,
  })
  if (note instanceof Error) {
    return failure('Could not createNote', note)
  }

  if (responseMode === 'full') {
    return {
      content: `${content} [📌](https://in.rough.app/workspace/${guild.roughWorkspacePublicId}/insight/active "View in Rough")`,
    }
  }
  return undefined
}

export { createInsight }
