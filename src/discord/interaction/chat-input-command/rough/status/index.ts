import type { ChatInputCommandHandler } from '#src/discord/types.js'

import { warning } from '#src/discord-utils.js'

import { getGuild } from '#src/db/guild/get-guild.js'

const onChatInputCommandRoughStatus: ChatInputCommandHandler = async (
  options,
) => {
  const { db, interaction, guildId } = options

  const guild = await getGuild({ db, where: { guildId } })
  if (guild instanceof Error) {
    await interaction.reply(
      warning(
        'This guild is not yet connected to Rough. Please use the `/rough connect` command to connect it.',
      ),
    )
    return
  }

  await interaction.reply({
    content: `This guild is currently connected to the Rough workspace "${guild.name}" \`${guild.roughWorkspaceId}\``,
    ephemeral: true,
  })
}

export { onChatInputCommandRoughStatus }
