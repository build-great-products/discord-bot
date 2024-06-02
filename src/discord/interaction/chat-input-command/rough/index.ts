import type { ChatInputCommandHandler } from '#src/discord/types.js'

import { failure } from '#src/discord-utils.js'

import { onChatInputCommandRoughConnect } from './connect/index.js'
import { onChatInputCommandRoughIdentify } from './identify/index.js'
import { onChatInputCommandRoughStatus } from './status/index.js'

const onChatInputCommandRough: ChatInputCommandHandler = async (options) => {
  const { interaction } = options

  const subcommandName = interaction.options.getSubcommand()

  switch (subcommandName) {
    case 'status': {
      return onChatInputCommandRoughStatus(options)
    }
    case 'connect': {
      return onChatInputCommandRoughConnect(options)
    }
    case 'identify': {
      return onChatInputCommandRoughIdentify(options)
    }
    default: {
      await interaction.reply(
        failure(`Unrecognised command: \`/rough ${subcommandName}\``),
      )
    }
  }
}

export { onChatInputCommandRough }
