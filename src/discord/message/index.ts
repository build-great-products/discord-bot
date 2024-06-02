import type { Message } from 'discord.js'

import type { GuildId, KyselyDb, UserId } from '#src/database.js'

import { createInsight } from '#src/create-insight.js'
import { failure } from '#src/discord-utils.js'

type MessageOptions = {
  db: KyselyDb
  message: Message
}
type MessageHandler = (options: MessageOptions) => Promise<void>

const onMessage: MessageHandler = async (options) => {
  const { db, message } = options

  // triggers whenever any message is sent...
  if (!message.mentions.users.has(message.client.user.id)) {
    console.log('Ignoring: Message does not mention bot')
    return
  }

  const guildId = message.guildId as GuildId
  if (!guildId) {
    throw new Error('Guild ID is missing.')
  }

  if (message.reference?.messageId) {
    const reference = await message.channel.messages.fetch(
      message.reference.messageId,
    )
    const userId = reference.author.id as UserId
    const content = reference.content
    if (!content) {
      await message.reply(failure('You must text for the insight.'))
      return
    }

    const response = await createInsight({
      db,
      guildId,
      userId,
      content,
      responseMode: 'only-error',
    })
    if (response) {
      await message.reply(response)
    }
    await reference.react('📌')
  }
}

export { onMessage }
