/**
 * config.js
 * Defines Config objects
 */

// Requires
const { Permissions } = require('discord.js') // The Permissions object from the discord.js library

/**
 * Defines a bot configuration object
 */
class Config {
  /**
   * Construct a new Config object
   * @param {Object} options An object containing options for this Config
   * @return {Config} The newly constructed Config object
   */
  constructor (options) {
    options = options || {} // If options was passed use it. Otherwise use an empty options object
    options.commandConfigs = options.commandConfigs || {} // Set commandConfigs to the input value or an empty object
    this.prefix = options.prefix || '--' // Set the command prefix. Defaults to '--'
    this.name = options.name || 'engage-bot' // Set the bot name. Defaults to 'engage-bot'
    this.defaultMessage = options.defaultMessage || `${this.name} was here!` // Set the default message for say.js commands. Defaults to 'engage-bot was here!'
    this.aboutMessage = options.aboutMessage || '' // Set text to be added onto the about message. Defaults to ''
    this.logAllMessages = options.logAllMessages || false // Set whether or not the bot should log all messages. Defaults to false
    this.displayChatErrors = options.displayChatErrors || false // Set whether or not the bot should respond with error messages. Defaults to false
    this.adminRoles = options.adminRoles || [] // Set the admin roles for this bot. Defaults to none
    this.adminPermissions = options.adminPermissions || [Permissions.FLAGS.ADMINISTRATOR] // Set the admin permissions for this bot. Defaults to Permissions.FLAGS.ADMINISTRATOR only
    this.adminUsers = options.adminUsers || [] // Set explicit bot admins. Defaults to none
    this.blacklist = options.blacklist || [] // Set of explicitly blacklisted users.
    this.scoring = Object.assign({ // Set scoring table and merge with any input table
      message: 10,
      typing: 1,
      speaking: 20,
      bonus: 100
    }, options.scoring)
    this.intervals = Object.assign({ // Set intervals table and merge with any input table
      bonus: 86400000,
      speaking: 10000,
      save: 60000,
      prune: 1209600000
    }, options.intervals)
    this.unit = options.unit || 'points' // Set the scoring unit. This should be plural. Defaults to 'points'
    this.token = options.token || '' // Set the login token. This must be set to login properly
    this.commandConfigs = { // Contains configuration data for additional commands
      slots: Object.assign({
        wheel: ['💖', '🍌', '🍒', '🍆', '💯', '🔞', '⚜', '🤑', '☄', '👌', '🗽', '🍭', '🎱', '🍄', '🌚'], // Represents a slot wheel for the slot machine
        scoreFactor: 0.25, // The multiplier for scores in the slot machine game
        wheelCount: 4 // The number of wheels for the slot machine to use
      }, options.commandConfigs.slots)
    }
  }

  /**
   * Determine whether an interval is valid
   * @param {Number} time An interval value to check
   * @return {Boolean} Whether or not this interval is valid
   */
  isValidInterval (time) {
    return time >= 0 && time <= 2147483647 // 2147483647 is the max valid value in most browsers
  }
}

module.exports = Config
