type Reply = {
  content: string
  ephemeral?: boolean
}

const warning = (message: string): Reply => {
  return {
    content: `⚠️ ${message}`,
    ephemeral: true,
  }
}

const failure = (message: string, error?: Error): Reply => {
  return {
    content: `❌ ${message}${error ? ` Error: \`${error.message}\`` : ''}`,
    ephemeral: true,
  }
}

const guildNotConnectedReply = warning(
  'This guild is not yet connected to Rough. Please use the `/rough connect` command to connect it.',
)

const userNotIdentifiedReply = warning(
  'You are not yet identified. Please use the `/rough identify` command to identify yourself.',
)

export { warning, failure, guildNotConnectedReply, userNotIdentifiedReply }

export type { Reply }
