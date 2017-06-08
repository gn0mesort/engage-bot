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
    this.prefix = options.prefix || '--' // Set the command prefix. Defaults to '--'
    this.name = options.name || 'engage-bot' // Set the bot name. Defaults to 'engage-bot'
    this.defaultMessage = options.defaultMessage || `${this.name} was here!` // Set the default message for say.js commands. Defaults to 'engage-bot was here!'
    this.aboutMessage = options.aboutMessage || '' // Set text to be added onto the about message. Defaults to ''
    this.logAllMessages = options.logAllMessages || false // Set whether or not the bot should log all messages. Defaults to false
    this.displayChatErrors = options.displayChatErrors || false // Set whether or not the bot should respond with error messages. Defaults to false
    this.adminRoles = options.adminRoles || [] // Set the admin roles for this bot. Defaults to none
    this.adminPermissions = options.adminPermissions || [Permissions.FLAGS.ADMINISTRATOR] // Set the admin permissions for this bot. Defaults to Permissions.FLAGS.ADMINISTRATOR only
    this.adminUsers = options.adminUsers || [] // Set explicit bot admins. Defaults to none
    this.scoring = options.scoring || { // Set the scoring object. Defaults to the following table
      message: 10,
      typing: 1,
      speaking: 20
    }
    this.bonus = options.bonus || 100 // Set the bonus point total. Defaults to 100 points
    this.bonusInterval = options.bonusInterval || 86400000 // Set the bonus interval in milliseconds. Defaults to 86400000 or 1 day
    this.speakingInterval = options.speakingInterval || 10000 // Set the voice scoring inteveral in milliseconds. Defaults to 10000 or 10 seconds
    this.saveInterval = options.saveInterval || 60000 // Set the save interval for the scores table in milliseconds. Defaults to 60000 or 1 minute
    this.unit = options.unit || 'points' // Set the scoring unit. This should be plural. Defaults to 'points'
    this.biddingOpen = false // Set whether or not bidding is open. Defaults to false
    this.token = options.token || '' // Set the login token. This must be set to login properly
  }
}

module.exports = Config
