/**
 * utility.js
 * A module that defines simple utility commands
 */

// Requires
const Command = require('../src/command.js') // Command objects

module.exports = {
  /**
   * A command that displays all the Discord.Role.prototype.id values for all the servers this bot belongs to.
   * As far as I know there is no other easy way to get the ID values without having a Discord.Role object first
   */
  'role-ids': new Command(
    function (message, self) {
      let output = '' // Set output to ''
      for (let guild of self.client.guilds.array()) { // For every server the bot has joined
        output += `${guild.name}:\n` // Output the server name
        for (let role of guild.roles.array()) { // For every role in the current server
          output += `  ${role.name} : ${role.id}\n` // Output the role name and id
        }
      }
      return message.author === 'CONSOLE' ? output : `\`\`\`\n${output}\n\`\`\`` // Output as block text if this command was received as a message rather than from the console
    },
    'Display all role ids for all the servers this bot belongs to',
    Command.FLAG.GENERAL
  ),
  /**
   * A command that displays a server's user count.
   * This is usually just the raw number from Guild.prototype.members.size
   */
  'user-count': new Command(
    function (message, self) {
      let channel = message.author !== 'CONSOLE' ? message.author.lastMessage.channel : message.author // Set the channel to the messages channel or CONSOLE in the case on console input
      if (channel.type === 'text') { // If channel is a text channel
        return `${channel.guild.members.size} users` // Return server size
      } else if (channel.type === 'dm') { // If channel is a dm channel
        return `2 users` // Return 2 because dm channels are private
      } else if (channel.type === 'group') { // If channel is a group dm
        return `${channel.recipients.size} users` // Return channel size
      } else { // Otherwise
        return '0 users' // No users
      }
    },
    'Respond with the server\'s current user count.',
    Command.FLAG.GENERAL
  ),
  /**
   * A simple echo command
   */
  'echo': new Command(
    function (message, self) {
      return message.content // Respond with the input message
    },
    'Echo the input message.',
    Command.FLAG.GENERAL
  ),
  /**
   * A command to ban users from accessing the bot
   */
  'ban': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      let id = args.length > 0 ? args[0].trim().replace(/<@!?([^&]+)>/g, '$1') : '' // Clean user id if one is found
      if (self.client.users.has(id) && Command.checkPermission(self.client.users.get(id), message.guild, self.config.adminRoles, self.config.adminPermissions, self.config.adminUsers) < Command.FLAG.ADMIN) { // If the user is known to the bot and not an admin
        if (self.data.blacklist.indexOf(id) === -1) { // If the user isn't banned
          self.data.blacklist.push(id) // Ban the user
          for (let channel in self.voiceUsers) { // For every channel of voiceUsers
            let index = self.voiceUsers[channel].map((element) => { // Create an array of just user ids
              return element.id
            }).indexOf(id) // Find the index of the current id value in the array
            if (index !== -1) { // If the value was found
              self.voiceUsers[channel].splice(index, 1) // Remove the user
            }
          }
          return `${self.client.users.get(id).tag} was banned!`
        } else { // Otherwise
          return 'That user is already banned!'
        }
      } else if (!self.client.users.has(id)) { // Otherwise if the user wasn't found
        return 'Can\'t ban an unknown user!'
      } else { // Otherwise
        return 'Can\'t ban admin users!'
      }
    },
    'Ban a user from issuing commands to this bot.\nArguments:\n`user`: The @ name or id of the user to ban.',
    Command.FLAG.ADMIN
  ),
  /**
   * A command to unban users from accessing the bot
   */
  'unban': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      let id = args.length > 0 ? args[0].trim().replace(/<@!?([^&]+)>/g, '$1') : '' // Clean user id if one is found
      if (self.client.users.has(id)) { // If the user is known to the bot
        let index = self.data.blacklist.indexOf(id) // Find the index of the user in the blacklist
        if (index !== -1) { // If the user is banned
          self.data.blacklist.splice(index, 1) // Unban the user
          for (let guild of self.client.guilds.array()) { // For each guild
            if (guild.members.has(id)) { // If this guild has this user
              let member = guild.members.get(id) // Set member to the correct GuildMember
              if (member.voiceChannel) { // If the member has a voice channel
                if (member.voiceChannelID in self.voiceUsers) { // If the channel is in voiceUsers
                  self.voiceUsers[member.voiceChannelID].push(member) // Push the member
                } else { // Otherwise
                  self.voiceUsers[member.voiceChannelID] = [member] // Create the voice channel in voiceUsers
                }
              }
            }
          }
          return `${self.client.users.get(id).tag} was unbanned!`
        } else { // Otherwise
          return 'That user isn\'t banned!'
        }
      } else { // Otherwise
        return 'Can\'t unban an unknown user!'
      }
    },
    'Unban a user from issuing commands to this bot.\nArguments:\n`user`: The @ name or id of the user to ban.',
    Command.FLAG.ADMIN
  )
}
