import type { ChatInputCommandHandler } from '#src/discord/types.js'

import { failure, warning } from '#src/discord-utils.js'

import * as roughApi from '#src/rough-api/index.js'

import { upsertGuildUser } from '#src/db/guild-user/upsert-guild-user.js'
import { getGuild } from '#src/db/guild/get-guild.js'

const onChatInputCommandRoughIdentify: ChatInputCommandHandler = async (
  options,
) => {
  const { db, interaction, guildId, userId } = options

  const roughUserId = interaction.options.getString('user')
  if (!roughUserId) {
    await interaction.reply(failure('You must specify a Rough User ID'))
    return
  }

  const guild = await getGuild({ db, where: { guildId } })
  if (guild instanceof Error) {
    await interaction.reply(
      warning(
        'This guild is not yet connected to Rough. Please use the `/rough connect` command to connect it.',
      ),
    )
    return
  }

  const user = await roughApi.getUser({
    apiToken: guild.apiToken,
    userId: roughUserId,
  })
  if (user instanceof Error) {
    await interaction.reply(
      failure(
        `Could not find User with ID \`${roughUserId}\` in Rough workspace "${guild.name}"`,
        user,
      ),
    )
    return
  }

  const guildUser = await upsertGuildUser({
    db,
    guildUser: {
      guildId,
      userId,
      roughUserId,
      name: user.name ?? '',
    },
  })
  if (guildUser instanceof Error) {
    await interaction.reply(
      failure('Could not upsert Guild User info', guildUser),
    )
    return
  }

  await interaction.reply(`Identified as user ${user.name} \`${user.email}\``)
}

export { onChatInputCommandRoughIdentify }
