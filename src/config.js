const { Permissions } = require('discord.js')

var Config = function () {
  this.commandPrefix = '--'
  this.botName = 'engage-bot'
  this.defaultMessage = `${this.botName} was here!`
  this.displayAllMessages = false
  this.adminRoles = [] // Roles that allow bot administration
  this.adminPermissions = [Permissions.FLAGS.ADMINISTRATOR] // If a user has all these privileges they are an admin
  this.adminUsers = [] // Explicit bot admins
  this.scoring = {
    message: 10,
    typing: 1,
    speaking: 100
  }
  this.scoreUnit = ''
  this.avatarPath = ''
  this.token = ''
}

module.exports = Config
