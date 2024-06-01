import {
  ApplicationCommandType,
  Client,
  ContextMenuCommandBuilder,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js'

import type { GuildId, UserId } from './database.js'

import { db } from './database.js'
import { upsertGuildUser } from './db/guild-user/upsert-guild-user.js'
import { getGuild } from './db/guild/get-guild.js'
import { upsertGuild } from './db/guild/upsert-guild.js'
import { migrateToLatest } from './migrate.js'

import { failure, warning } from './discord-utils.js'
import { env } from './env.js'

import * as roughApi from './rough-api/index.js'

import { createInsight } from './create-insight.js'

await migrateToLatest(db)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const rest = new REST({
  version: '10',
}).setToken(env.BOT_TOKEN)

const insightCommand = new SlashCommandBuilder()
  .setName('insight')
  .setDescription('Create an insight')
  .addStringOption((option) =>
    option
      .setName('text')
      .setDescription('The text of the insight')
      .setRequired(true),
  )

const roughCommand = new SlashCommandBuilder()
  .setName('rough')
  .setDescription('Commands for Rough')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('status')
      .setDescription('Get the status of the Rough connection'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('connect')
      .setDescription('Connect this guild to Rough')
      .addStringOption((option) =>
        option
          .setName('api_token')
          .setDescription('The API token for the Rough workspace')
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('identify')
      .setDescription('Identify yourself')
      .addStringOption((option) =>
        option
          .setName('user')
          .setDescription('Your user ID')
          .setAutocomplete(true)
          .setRequired(true),
      ),
  )

const contextMenu = new ContextMenuCommandBuilder()
  .setName('Insight')
  .setType(ApplicationCommandType.Message)

try {
  console.log('Started refreshing application (/) commands.')

  await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
    body: [contextMenu, roughCommand, insightCommand],
  })

  console.log('Successfully reloaded application (/) commands.')
} catch (error) {
  console.error(error)
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('error', (error) => {
  console.error(error)
})

client.on('messageCreate', async (message) => {
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
})

client.on('interactionCreate', async (interaction) => {
  const guildId = interaction.guildId as GuildId
  if (!guildId) {
    throw new Error('Guild ID is missing.')
  }

  const userId = interaction.user.id as UserId
  if (!userId) {
    throw new Error('User ID is missing.')
  }

  if (interaction.isContextMenuCommand()) {
    if (interaction.commandName === 'Insight') {
      const message = await interaction.channel?.messages.fetch(
        interaction.targetId,
      )
      if (!message) {
        await interaction.reply(failure('Could not find message'))
        return
      }
      const content = message.content
      if (!content) {
        await interaction.reply(failure('You must text for the insight.'))
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
    await interaction.reply(
      warning(`Unrecognised command: \`${interaction.commandName}\``),
    )
  } else if (interaction.isAutocomplete()) {
    const guild = await getGuild({ db, where: { guildId } })
    if (guild instanceof Error) {
      await interaction.respond([
        {
          name: 'This guild is not yet connected to Rough. Please use the `/rough connect` command to connect it.',
          value: '-',
        },
      ])
      return
    }

    const userList = await roughApi.getUserList({
      apiToken: guild.apiToken,
    })
    if (userList instanceof Error) {
      await interaction.respond([
        {
          name: '⚠️ Failed to get user list.',
          value: '-',
        },
      ])
      return
    }

    const focusedValue = interaction.options.getFocused()

    const filteredUserList = userList.filter((user) =>
      user.name?.toLowerCase().startsWith(focusedValue.toLowerCase()),
    )

    interaction.respond(
      filteredUserList.map((user) => {
        return {
          name: user.name ?? '',
          value: user.id,
        }
      }),
    )
    return
  }

  if (!interaction.isChatInputCommand()) {
    return
  }

  const { commandName, options } = interaction

  if (commandName === 'rough') {
    const subcommandName = options.getSubcommand()
    console.log(`/rough ${subcommandName}`)

    if (subcommandName === 'status') {
      const guild = await getGuild({ db, where: { guildId } })
      if (guild instanceof Error) {
        await interaction.reply(
          warning(
            'This guild is not yet connected to Rough. Please use the `/rough connect` command to connect it.',
          ),
        )
        return
      }

      await interaction.reply({
        content: `This guild is currently connected to the Rough workspace "${guild.name}" \`${guild.roughWorkspaceId}\``,
        ephemeral: true,
      })
      return
    }
    if (subcommandName === 'connect') {
      const apiToken = options.getString('api_token')
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
      return
    }
    if (subcommandName === 'identify') {
      const roughUserId = options.getString('user')
      if (!roughUserId) {
        await interaction.reply(failure('You must specify a Rough User ID'))
        return
      }

      const guild = await getGuild({ db, where: { guildId } })
      if (guild instanceof Error) {
        await interaction.reply(
          warning(
            'This guild is not yet connected to Rough. Please use the `/rough connect` command to connect it.',
          ),
        )
        return
      }

      const user = await roughApi.getUser({
        apiToken: guild.apiToken,
        userId: roughUserId,
      })
      if (user instanceof Error) {
        await interaction.reply(
          failure(
            `Could not find User with ID \`${roughUserId}\` in Rough workspace "${guild.name}"`,
            user,
          ),
        )
        return
      }

      const guildUser = await upsertGuildUser({
        db,
        guildUser: {
          guildId,
          userId,
          roughUserId,
          name: user.name ?? '',
        },
      })
      if (guildUser instanceof Error) {
        await interaction.reply(
          failure('Could not upsert Guild User info', guildUser),
        )
        return
      }

      await interaction.reply(
        `Identified as user ${user.name} \`${user.email}\``,
      )
      return
    }

    await interaction.reply(
      warning(`Unrecognised command: \`/rough ${subcommandName}\``),
    )
    return
  }
  if (commandName === 'insight') {
    const text = options.getString('text')
    if (!text) {
      await interaction.reply(failure('You must text for the insight.'))
      return
    }

    const response = await createInsight({
      db,
      guildId,
      userId,
      content: text,
    })
    if (response) {
      await interaction.reply(response)
    }
  }
})

client.login(env.BOT_TOKEN)
