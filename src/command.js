/**
 * command.js
 * Defines Command objects and related behavior
 */

/**
 * Permissions flags
 */
const FLAG = {
  /**
   * General command permissions for commands usable by everyone. Has a value of 1
   */
  get GENERAL () { return 0x1 },
  /**
   * Admin command permissions only usable by an Admin user or from the Console. Has a value of 2
   */
  get ADMIN () { return 0x2 },
  /**
   * Console permissions only usable from the Console. Has a value of 3
   */
  get CONSOLE () { return 0x3 }
}

/**
 * Check if a user has permissions
 * @param {Discord.User} user The user to check permissions for
 * @param {Discord.Guild} guild The guild the user is from
 * @param {Array} adminRoles An array of Discord.Role ids that grant admin permissions
 * @param {Array} adminPermissions An array of Discord.Permissions that grant admin permissions
 * @param {Array} adminUsers An array of Discord.User ids that grant admin permissions
 * @return {Number} A number value indicating the permission level of the input user
 */
const checkPermission = function (user, guild, adminRoles, adminPermissions, adminUsers) {
  if (user === 'CONSOLE') { // If the user is the Console
    return FLAG.CONSOLE // Console Permissions
  } else { // Otherwise
    let guildMember = guild ? guild.members.get(user.id) : null // Set guildMember to the GuildMember associated with this user
    let r = FLAG.GENERAL // Set r to general permissions
    for (let roleId of adminRoles) { // For every role id in adminRoles
      if (guildMember && guildMember.roles.has(roleId)) { // If the user has the role
        r = FLAG.ADMIN // The user is an Admin
      }
    }
    if (guildMember.permissions.has(adminPermissions) || adminUsers.indexOf(user.id) !== -1) { // If the user has Admin permissions or is explicitly listed as an Admin
      r = FLAG.ADMIN // The user is an Admin
    }
    return r
  }
}

/**
 * Validate permissions
 * @param {Number} permission The permission value to check
 * @return {Number} A valid permission or null if not found
 */
const validate = function (permission) {
  for (let flag in FLAG) { // For every permission
    if (permission === FLAG[flag]) { // If permission is found in FLAG
      return permission // Return the permission
    }
  }
  return null // Otherwise return null
}

/**
 * A class defining a command that may be used to control the bot
 */
class Command {
  /**
   * Construct a new Command
   * @param {Function} action The action for this command to perform when Command.prototype.do is invoked
   * @param {String} help A string containing help text for this Command. Defaults to ''
   * @param {Number} permission The permission level required to perform this Command. Defaults to FLAG.CONSOLE
   * @return {Command} The newly constructed Command
   */
  constructor (action, help, permission) {
    this._commandPermission = FLAG.GENERAL // Set backing commandPermission
    this.action = action // Set the action for this Command
    this.help = help || '' // Set the help to help or ''
    this.commandPermission = permission || FLAG.CONSOLE // Set the commandPermission to permission or FLAG.CONSOLE
  }

  /**
   * Get the current commandPermission value
   * @return {Number} The current commandPermission value
   */
  get commandPermission () {
    return this._commandPermission
  }

  /**
   * Set the current commandPermission value
   * @param {Number} value The value to set
   */
  set commandPermission (value) {
    this._commandPermission = validate(value) || FLAG.CONSOLE // Validate and set value. If the value is invalid set permissions to FLAG.CONSOLE
  }

  /**
   * Perform this Command's action
   * @param {Discord.Message} message The message that was passed with the command invocation
   * @param {Bot} self The bot that was used to invoke this Command
   * @return {String} The response for this Command or null
   */
  do (message, self) {
    if (this.commandPermission <= Command.checkPermission(message.author, message.guild, self.config.adminRoles, self.config.adminPermissions, self.config.adminUsers)) { // If permissions are valid
      return this.action(message, self) // Perform the Command
    } else if (self.config.displayChatErrors || message.author === 'CONSOLE') { // Otherwise if the bot is displaying errors or the Command came from the console
      return 'Invalid Permission!' // Return error
    } else { // Otherwise
      return null // Return nothing
    }
  }

  /**
   * Check is a message's author has permission to use this Command
   * @param {Discord.Message} message The message to check the author of
   * @param {Bot} self The bot that was used to invoke this Command
   * @return {Boolean} Whether or not the message author has permission to use this Command
   */
  hasPermission (message, self) {
    return this.commandPermission <= Command.checkPermission(message.author, message.guild, self.config.adminRoles, self.config.adminPermissions, self.config.adminUsers)
  }

  /**
   * Check if a user has permissions
   * @param {Discord.User} user The user to check permissions for
   * @param {Discord.Guild} guild The guild the user is from
   * @param {Array} adminRoles An array of Discord.Role ids that grant admin permissions
   * @param {Array} adminPermissions An array of Discord.Permissions that grant admin permissions
   * @param {Array} adminUsers An array of Discord.User ids that grant admin permissions
   * @return {Number} A number value indicating the permission level of the input user
   */
  static checkPermission (user, guild, adminRoles, adminPermissions, adminUsers) {
    if (user === 'CONSOLE') { // If the user is the Console
      return FLAG.CONSOLE // Console Permissions
    } else { // Otherwise
      let guildMember = guild ? guild.members.get(user.id) : null // Set guildMember to the GuildMember associated with this user
      let r = FLAG.GENERAL // Set r to general permissions
      for (let roleId of adminRoles) { // For every role id in adminRoles
        if (guildMember && guildMember.roles.has(roleId)) { // If the user exists and has the role
          r = FLAG.ADMIN // The user is an Admin
        }
      }
      if ((guildMember && guildMember.permissions.has(adminPermissions)) || adminUsers.indexOf(user.id) !== -1) { // If the user exists and has Admin permissions or is explicitly listed as an Admin
        r = FLAG.ADMIN // The user is an Admin
      }
      return r
    }
  }
}

module.exports = Command
module.exports.FLAG = FLAG
