import type { InteractionReplyOptions } from 'discord.js'

const warning = (message: string): InteractionReplyOptions => {
  return {
    content: `⚠️ ${message}`,
    ephemeral: true,
  }
}

const failure = (message: string, error?: Error): InteractionReplyOptions => {
  return {
    content: `❌ ${message}${error ? ` Error: \`${error.message}\`` : ''}`,
    ephemeral: true,
  }
}

export { warning, failure }
