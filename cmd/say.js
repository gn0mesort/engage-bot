const Command = require('../src/command.js')

module.exports = {
  'say-all': new Command(
    function (message, self) {
      for (let guild of self.client.guilds.array()) {
        if (message.content) {
          guild.defaultChannel.send(message.content)
          return ''
        }
      }
      return 'Empty message or no servers!'
    },
    'Send a message to all servers this bot is a member of.\nArguments:\n`text`: The message to send.',
    Command.FLAG.CONSOLE
  ),
  'say-to': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      let text = message.content.replace(new RegExp(`^${args[0]}`, 'g'), '')
      for (let guild of self.client.guilds.array()) {
        if (text && (args[0] === guild.name || args[0] === guild.id)) {
          guild.defaultChannel.send(text)
          return ''
        }
      }
      return 'Empty message or invalid server!'
    },
    'Send a message to a specific server.\nArguments:\n`server`: A server name or id to send messages to.\n`text` The message to send.',
    Command.FLAG.CONSOLE
  ),
  'say': new Command(
    function (message, self) {
      if (message.content) {
        self.client.guilds.first().defaultChannel.send(message.content)
        return ''
      } else {
        return 'Empty message or no servers!'
      }
    },
    'Send a message to the server at self.guilds.first().\nArguments:\n`text`: The message to send.',
    Command.FLAG.CONSOLE
  )
}
