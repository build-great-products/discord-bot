import {
  ApplicationCommandType,
  Client,
  ContextMenuCommandBuilder,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js'

import type { KyselyDb } from '#src/database.js'

import { onInteraction } from './interaction/index.js'
import { onMessage } from './message/index.js'

type CreateClientOptions = {
  db: KyselyDb
  clientId: string
  botToken: string
}

const createClient = async (options: CreateClientOptions) => {
  const { db, clientId, botToken } = options

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  const rest = new REST({ version: '10' }).setToken(botToken)

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

    await rest.put(Routes.applicationCommands(clientId), {
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
    await onMessage({ db, message })
  })

  client.on('interactionCreate', async (interaction) => {
    await onInteraction({ db, interaction })
  })

  client.login(botToken)
}

export { createClient }
