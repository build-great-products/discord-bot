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

  let content = message.content
  if (content.trim().length === 0) {
    await interaction.reply(failure('The insight text cannot be empty.'))
    return
  }

  if (message.author.id !== userId) {
    content = `${message.author.username} said: ${content}`
  }

  const { success, reply } = await createInsight({
    db,
    guildId,
    userId,
    content,
    referenceUrl: message.url,
  })
  if (success) {
    await message.react('📌')
    await interaction.reply({
      content: '✅ Captured insight successfully.',
      ephemeral: true,
    })
  } else {
    await interaction.reply(reply)
  }
}

export { onContextMenuInsight }
