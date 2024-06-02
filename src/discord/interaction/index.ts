import type { Interaction } from 'discord.js'

import type { GuildId, KyselyDb, UserId } from '#src/database.js'

import { onAutocomplete } from './autocomplete/index.js'
import { onChatInputCommand } from './chat-input-command/index.js'
import { onContextMenuCommand } from './context-menu-command/index.js'

type InteractionOptions = {
  db: KyselyDb
  interaction: Interaction
}
type InteractionHandler = (options: InteractionOptions) => Promise<void>

const onInteraction: InteractionHandler = async (options) => {
  const { db, interaction } = options

  const guildId = interaction.guildId as GuildId
  if (!guildId) {
    throw new Error('Guild ID is missing.')
  }

  const userId = interaction.user.id as UserId
  if (!userId) {
    throw new Error('User ID is missing.')
  }

  if (interaction.isContextMenuCommand()) {
    await onContextMenuCommand({ db, interaction, guildId, userId })
  } else if (interaction.isAutocomplete()) {
    await onAutocomplete({ db, interaction, guildId, userId })
  } else if (interaction.isChatInputCommand()) {
    await onChatInputCommand({ db, interaction, guildId, userId })
  }
}

export { onInteraction }
