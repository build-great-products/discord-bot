import type { AutocompleteHandler } from '#src/discord/types.js'

import { stripPrefix } from '#src/discord/prefix.js'

import { onAutocompleteRough } from './rough/index.js'

const onAutocomplete: AutocompleteHandler = async (options) => {
  const { interaction, commandPrefix } = options

  switch (stripPrefix(commandPrefix, interaction.commandName)) {
    case 'rough': {
      return onAutocompleteRough(options)
    }
    default: {
      await interaction.respond([
        {
          name: `⚠️ Unrecognised autocomplete: \`${interaction.commandName}\``,
          value: '-',
        },
      ])
    }
  }
}

export { onAutocomplete }
