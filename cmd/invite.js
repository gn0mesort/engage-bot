/**
 * invite.js
 * Defines commands for joining and leaving servers
 */

// Requires
const Command = require('../src/command.js') // Command objects
const botconsole = require('../src/botconsole.js') // botconsole functions

module.exports = {
  /**
   * Generate an invite link for the current Bot
   */
  'invite': new Command(
    function (message, self) {
      try { // Try to get an new invite
        let permissions = message.content.split(' ').filter(function (perm) { // Parse permissions
          return perm !== '' && perm !== ' ' // Remove any empty or space strings
        })
        if (permissions.length === 0) { // If there were no permissions
          permissions = require('discord.js').Permissions.DEFAULT // Use default permissions
        }
        self.client.generateInvite(permissions).then((link) => { // Generate link
          botconsole.out(link) // Log link on success
          self.rl.prompt() // Prompt stdin
        }, (err) => {
          botconsole.out(err) // Log errors
          self.rl.prompt() // Prompt stdin
        })
        return '' // Return an empty string
      } catch (err) { // Catch errors
        return err // Return the error
      }
    },
    'Fetch a bot invite link with the given permissions.\nArguments:\n`permissions`: The permissions this bot should request as the names of Discord.js Permissions.',
    Command.FLAG.CONSOLE
  ),
  /**
   * Leave a specific server
   */
  'leave': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      for (let guild of self.client.guilds.array()) { // For every server in this bot's server list
        if (args[0] === guild.name || args[0] === guild.id) { // If the first argument matches the server name or id
          guild.leave() // Leave the server
        }
      }
    },
    'Leave the given server.\nArguments:\n`server`: A server name or id to leave.'
  )
}
