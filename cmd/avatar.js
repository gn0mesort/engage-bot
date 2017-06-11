/**
 * avatar.js
 * Define commands for setting the bot's avatar
 */

// Requires
const Command = require('../src/command.js') // Command objects
const botconsole = require('../src/botconsole.js') // botconsole functions
const fs = require('fs') // Node filesystem library

module.exports = {
  /**
   * Set the bot's avatar
   */
  'set-avatar': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      if (fs.existsSync(args[0]) && !fs.statSync(args[0]).isDirectory()) { // If the file in the arguments exists and is not a directory
        self.client.user.setAvatar(args[0]).then(function (user) { // Set the avatar
          botconsole.out('Avatar set!') // Then output that the avatar was set
          self.rl.prompt() // Prompt stdin
        }).catch(function (err) {
          botconsole.error(err) // Log errors
          self.rl.prompt() // Prompt stdin
        })
        return `Setting avatar to ${args[0]}`
      } else { // Otherwise
        return 'File not found!'
      }
    },
    'Set this bot\'s avatar.\nArguments:\n`file`: A path or URL to a file to set the bot\'s avatar too.',
    Command.FLAG.CONSOLE
  ),
  /**
   * Reset the bot's avatar to the default Discord avatar
   */
  'reset-avatar': new Command(
    function (message, self) {
      self.client.user.setAvatar(self.client.user.defaultAvatarURL).then(function (user) { // Reset avatar
        botconsole.out('Avatar set!') // Then output that the avatar was set
        self.rl.prompt() // Prompt stdin
      }).catch(function (err) {
        botconsole.error(err) // Log errors
        self.rl.prompt() // Prompt stdin
      })
      return 'Resetting Avatar!'
    },
    'Reset this bot\'s avatar to the default avatar.',
    Command.FLAG.CONSOLE
  )
}
