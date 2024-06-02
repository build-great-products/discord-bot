import type { AutocompleteHandler } from '#src/discord/types.js'

import * as roughApi from '#src/rough-api/index.js'

import { getGuild } from '#src/db/guild/get-guild.js'

const onAutocompleteRoughIdentify: AutocompleteHandler = async (options) => {
  const { db, interaction, guildId } = options

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
}

export { onAutocompleteRoughIdentify }
