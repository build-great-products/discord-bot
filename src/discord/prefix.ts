const joinPrefix = (commandPrefix: string, command: string) => {
  if (commandPrefix.length > 0) {
    return `${commandPrefix}-${command}`
  }
  return command
}

const stripPrefix = (commandPrefix: string, command: string) => {
  if (commandPrefix.length > 0) {
    if (command.startsWith(commandPrefix)) {
      return command.slice(commandPrefix.length + 1)
    }
  }
  return command
}

export { joinPrefix, stripPrefix }
