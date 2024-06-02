import type { ContextMenuCommandHandler } from '#src/discord/types.js'

import { failure } from '#src/discord-utils.js'

import { createInsight } from '#src/create-insight.js'

const onContextMenuInsight: ContextMenuCommandHandler = async (options) => {
  const { db, interaction, guildId, userId } = options

  const message = await interaction.channel?.messages.fetch(
    interaction.targetId,
  )
  if (!message) {
    await interaction.reply(failure('Could not find message'))
    return
  }

  const content = message.content
  if (content.trim().length === 0) {
    await interaction.reply(failure('The insight text cannot be empty.'))
    return
  }

  const response = await createInsight({
    db,
    guildId,
    userId,
    content,
  })
  if (response) {
    await interaction.reply(response)
  }
}

export { onContextMenuInsight }
