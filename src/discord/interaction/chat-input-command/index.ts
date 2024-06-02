import type { ChatInputCommandHandler } from '#src/discord/types.js'

import { warning } from '#src/discord-utils.js'

import { onChatInputCommandInsight } from './insight/index.js'
import { onChatInputCommandRough } from './rough/index.js'

const onChatInputCommand: ChatInputCommandHandler = async (options) => {
  const { interaction } = options
  switch (interaction.commandName) {
    case 'rough': {
      return onChatInputCommandRough(options)
    }
    case 'insight': {
      return onChatInputCommandInsight(options)
    }
    default: {
      await interaction.reply(
        warning(`Unrecognised command: \`${interaction.commandName}\``),
      )
    }
  }
}

export { onChatInputCommand }
