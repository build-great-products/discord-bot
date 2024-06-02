import type { ChatInputCommandHandler } from '#src/discord/types.js'

import { failure } from '#src/discord-utils.js'

import * as roughApi from '#src/rough-api/index.js'

import { upsertGuild } from '#src/db/guild/upsert-guild.js'

const onChatInputCommandRoughConnect: ChatInputCommandHandler = async (
  options,
) => {
  const { db, interaction, guildId } = options

  const apiToken = interaction.options.getString('api_token')
  if (!apiToken) {
    await interaction.reply(failure('You must specify an API token'))
    return
  }

  const roughWorkspace = await roughApi.getCurrentWorkspace({ apiToken })
  if (roughWorkspace instanceof Error) {
    await interaction.reply(
      failure(
        'API Token could not be used retrieve Workspace details',
        roughWorkspace,
      ),
    )
    return
  }

  const guild = await upsertGuild({
    db,
    guild: {
      id: guildId,
      roughWorkspaceId: roughWorkspace.id,
      roughWorkspacePublicId: roughWorkspace.publicId,
      name: roughWorkspace.name,
      apiToken,
    },
  })
  if (guild instanceof Error) {
    await interaction.reply(failure('Could not upsert Guild info', guild))
    return
  }

  await interaction.reply({
    content: `✅ Successfully connected to Rough workspace "${roughWorkspace.name}" \`${roughWorkspace.id}\``,
    ephemeral: true,
  })
}

export { onChatInputCommandRoughConnect }
