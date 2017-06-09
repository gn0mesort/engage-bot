/**
 * ping.js
 * A module that displays ping to Discord for the bot
 */

// Requires
const Command = require('../src/command.js') // Command objects

module.exports = {
  /**
   * Display the ping to Discord of the current client in milliseconds
   */
  'ping': new Command(
    function (message, self) {
      return `${self.client.ping.toFixed(2)}ms` // Return the current client ping. Accurate to 2 places
    },
    'Get the ping from this bot to Discord\'s servers in milliseconds.',
    Command.FLAG.GENERAL
  )
}
