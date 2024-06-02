import type { ContextMenuCommandHandler } from '#src/discord/types.js'

import { warning } from '#src/discord-utils.js'

import { onContextMenuInsight } from './insight/index.js'

const onContextMenuCommand: ContextMenuCommandHandler = async (options) => {
  const { interaction } = options
  switch (interaction.commandName) {
    case 'Insight': {
      return onContextMenuInsight(options)
    }
    default: {
      await interaction.reply(
        warning(`Unrecognised command: \`${interaction.commandName}\``),
      )
    }
  }
}

export { onContextMenuCommand }
