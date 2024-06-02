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

  // This hangler triggers whenever any message is sent.
  // We must be very careful about infinite loops.
  //
  // We only want to respond to messages that mention the bot.
  // And ignore messages that are sent by the bot itself.

  if (message.author.id === message.client.user.id) {
    console.info('Ignoring: Message sent by bot')
    return
  }
  if (!message.mentions.users.has(message.client.user.id)) {
    console.info('Ignoring: Message does not mention bot')
    return
  }

  const guildId = message.guildId as GuildId | null
  if (!guildId) {
    throw new Error('Guild ID is missing.')
  }

  const userId = message.author.id as UserId

  const referenceMessageId = message.reference?.messageId

  if (!referenceMessageId) {
    await message.reply(
      failure('Please reply to a message to capture an insight.'),
    )
    return
  }

  const customerName =
    message.content.replace(/<@\d+>/g, '').trim() || undefined

  const referenceMessage =
    await message.channel.messages.fetch(referenceMessageId)

  const content = referenceMessage.content
  if (content.trim().length === 0) {
    await message.reply(failure('The insight text cannot be empty.'))
    return
  }

  const { success, reply } = await createInsight({
    db,
    guildId,
    userId,
    content,
    referenceUrl: referenceMessage.url,
    customerName,
  })

  if (success) {
    await referenceMessage.react('📌')
  } else {
    await message.reply(reply)
  }
}

export { onMessage }
