/**
 * help.js
 * Defines commands that display help information for the current bot
 */

// Requires
const Command = require('../src/command.js') // Command objects
const botconsole = require('../src/botconsole.js') // botconsole functions
const fs = require('fs') // Node filesystem library

module.exports = {
  /**
   * Display help information for all commands available to the sending user
   */
  'help': new Command(
    function (message, self) {
      let output = '' // Set output to an empty string
      for (let command in self.commands) { // For every command in this bot
        if (self.commands[command].hasPermission(message, self)) { // If the sender has permission to use the command
          output += `\`${message.author === 'CONSOLE' ? '' : self.config.prefix}${command}\`\n${self.commands[command].help}\n\n` // Add the command name and command help message to output
        }
      }
      if (message.author === 'CONSOLE') { // If the message was sent from the console
        return output.join('\n') // Return the message
      }
      message.author.createDM().then(function (channel) { // Otherwise create a direct message to the author
        channel.send(output, {split: true}).catch(function (err) { // Then send the message
          botconsole.out(err) // Log errors
          botconsole.prompt() // Prompt stdin
        })
      })
      return 'Help is on the way!' // Return server message notifying the user
    },
    'Display this help message.',
    Command.FLAG.GENERAL
  ),
  /**
   * Display information about this bot
   */
  'about': new Command(
    function (message, self) {
      let npmPackage = JSON.parse(fs.readFileSync('./package.json')) // Load the information in package.json
      let output = `${npmPackage.name} ${npmPackage.version} by ${npmPackage.author}\nLICENSE: ${npmPackage.license}\n${npmPackage.repository.url.replace('.git', '')}\n${self.config.aboutMessage}` // Set output to the about text plus the custom about message
      return message.author === 'CONSOLE' ? output : `\`\`\`\n${output}\n\`\`\`` // Return block text to the server or standard text to the console
    },
    'Display information about this bot.',
    Command.FLAG.GENERAL
  )
}
