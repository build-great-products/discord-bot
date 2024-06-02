import type { AutocompleteHandler } from '#src/discord/types.js'

import { onAutocompleteRough } from './rough/index.js'

const onAutocomplete: AutocompleteHandler = async (options) => {
  const { interaction } = options
  switch (interaction.commandName) {
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
