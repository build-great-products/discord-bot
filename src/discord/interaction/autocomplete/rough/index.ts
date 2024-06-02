import type { AutocompleteHandler } from '#src/discord/types.js'

import { onAutocompleteRoughIdentify } from './identify/index.js'

const onAutocompleteRough: AutocompleteHandler = async (options) => {
  const { interaction } = options

  const subcommandName = interaction.options.getSubcommand()

  switch (subcommandName) {
    case 'identify': {
      return onAutocompleteRoughIdentify(options)
    }
    default: {
      await interaction.respond([
        {
          name: `⚠️ Unrecognised autocomplete: \`/rough ${subcommandName}\``,
          value: '-',
        },
      ])
    }
  }
}

export { onAutocompleteRough }
