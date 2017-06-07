const { Permissions } = require('discord.js')

class Config {
  constructor (options) {
    options = options || {}
    this.prefix = options.prefix || '--'
    this.name = options.name || 'engage-bot'
    this.defaultMessage = options.defaultMessage || `${this.name} was here!`
    this.aboutMessage = options.aboutMessage || ''
    this.logAllMessages = options.logAllMessages || false
    this.displayChatErrors = options.displayChatErrors || false
    this.adminRoles = options.adminRoles || []
    this.adminPermissions = options.adminPermissions || [Permissions.FLAGS.ADMINISTRATOR]
    this.adminUsers = options.adminUsers || []
    this.scoring = options.scoring || {
      message: 10,
      typing: 1,
      speaking: 20
    }
    this.speakingInterval = options.speakingInterval || 10000
    this.saveInterval = options.saveInterval || 60000
    this.unit = options.unit || 'points'
    this.biddingOpen = false
    this.token = options.token || ''
  }
}

module.exports = Config
