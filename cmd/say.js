/**
 * say.js
 * Defines commands for making engage-bot post to a server or multiple servers
 */

// Requires
const Command = require('../src/command.js') // Command objects
const botconsole = require('../src/botconsole.js') // botconsole functions

module.exports = {
  /**
   * Send a message to all servers that this bot has joined
   */
  'say-all': new Command(
    function (message, self) {
      if (message.content) { // If the message isn't empty
        for (let guild of self.client.guilds.array()) { // For every server that the Bot has joined
          guild.defaultChannel.send(message.content).catch(function (err) {
            botconsole.out(err) // Log errors
            self.rl.prompt() // Prompt stdin
          })
          return '' // Return an empty string
        }
      }
      return 'Empty message or no servers!' // Return an error message
    },
    'Send a message to all servers this bot is a member of.\nArguments:\n`text`: The message to send.',
    Command.FLAG.CONSOLE
  ),
  /**
   * Send a message to a server's general channel
   */
  'say-to': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      let text = message.content.replace(new RegExp(`^${args[0]}`, 'g'), '') // Get the text content by cleaning out the server name
      for (let guild of self.client.guilds.array()) { // For every server this bot has joined
        if (text && (args[0] === guild.name || args[0] === guild.id)) { // If there is text to post and the first argument is the current server name or the current server id
          guild.defaultChannel.send(text).catch(function (err) {
            botconsole.out(err) // Log errors
            self.rl.prompt() // Prompt stdin
          })
          return '' // Return an empty string
        }
      }
      return 'Empty message or invalid server!' // Return an error message
    },
    'Send a message to a specific server.\nArguments:\n`server`: A server name or id to send messages to.\n`text` The message to send.',
    Command.FLAG.CONSOLE
  ),
  /**
   * Send a message to the first server in the bot's server collection
   */
  'say': new Command(
    function (message, self) {
      if (message.content) { // If there is a message
        self.client.guilds.first().defaultChannel.send(message.content).catch(function (err) { // Send the message to the default channel of the first server
          botconsole.out(err) // Log errors
          self.rl.prompt() // Prompt stdin
        })
        return '' // Return an empty string
      } else {
        return 'Empty message or no servers!' // Return an error message
      }
    },
    'Send a message to the server at self.guilds.first().\nArguments:\n`text`: The message to send.',
    Command.FLAG.CONSOLE
  )
}
