import * as roughApi from '@roughapp/sdk'

import type { GuildId, KyselyDb, UserId } from './database.js'

import { getRoughAppUrl } from '#src/env.js'

import { getGuildUser } from './db/guild-user/get-guild-user.js'
import { getGuild } from './db/guild/get-guild.js'

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
  content: string
  referenceUrl?: string
  personName?: string
}

const createInsight = async (
  options: CreateInsightOptions,
): Promise<{ success: boolean; reply: Reply }> => {
  const { db, guildId, userId, content, referenceUrl, personName } = options

  const guild = await getGuild({ db, where: { guildId } })
  if (guild instanceof Error) {
    return { success: false, reply: guildNotConnectedReply }
  }

  const apiToken = guild.apiToken

  const guildUser = await getGuildUser({ db, where: { guildId, userId } })
  if (guildUser instanceof Error) {
    return { success: false, reply: userNotIdentifiedReply }
  }

  let referenceId: string | undefined
  let personId: string | undefined

  if (referenceUrl) {
    const snippet =
      content.length > 40 ? `${content.trim().slice(0, 40).trim()}…` : content

    const reference = await roughApi.createReference({
      baseUrl: getRoughAppUrl(),
      apiToken,
      name: `Discord: "${snippet}"`,
      url: referenceUrl,
    })
    if (reference instanceof Error) {
      return {
        success: false,
        reply: failure('Could not createReference', reference),
      }
    }
    referenceId = reference.id
  }

  if (personName) {
    const person = await roughApi.createPerson({
      baseUrl: getRoughAppUrl(),
      apiToken,
      name: personName,
    })
    if (person instanceof Error) {
      return {
        success: false,
        reply: failure('Could not createPerson', person),
      }
    }
    personId = person.id
  }

  const note = await roughApi.createNote({
    baseUrl: getRoughAppUrl(),
    apiToken,
    content,
    createdByUserId: guildUser.roughUserId,
    referenceId,
    personId,
  })
  if (note instanceof Error) {
    return { success: false, reply: failure('Could not createNote', note) }
  }

  return {
    success: true,
    reply: {
      content: `${content} [📌](https://in.rough.app/workspace/${guild.roughWorkspacePublicId}/insight/active "View in Rough")`,
    },
  }
}

export { createInsight }
