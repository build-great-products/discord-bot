import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
} from 'discord.js'

import type { GuildId, KyselyDb, UserId } from '#src/database.js'

type AutocompleteOptions = {
  db: KyselyDb
  interaction: AutocompleteInteraction
  guildId: GuildId
  userId: UserId
  commandPrefix: string
}

type AutocompleteHandler = (options: AutocompleteOptions) => Promise<void>

type ContextMenuCommandOptions = {
  db: KyselyDb
  interaction: ContextMenuCommandInteraction
  guildId: GuildId
  userId: UserId
  commandPrefix: string
}

type ContextMenuCommandHandler = (
  options: ContextMenuCommandOptions,
) => Promise<void>

type ChatInputCommandOptions = {
  db: KyselyDb
  interaction: ChatInputCommandInteraction
  guildId: GuildId
  userId: UserId
  commandPrefix: string
}

type ChatInputCommandHandler = (
  options: ChatInputCommandOptions,
) => Promise<void>

export type {
  ChatInputCommandOptions,
  ChatInputCommandHandler,
  ContextMenuCommandOptions,
  ContextMenuCommandHandler,
  AutocompleteOptions,
  AutocompleteHandler,
}
