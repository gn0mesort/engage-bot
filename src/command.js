const FLAG = {
  get GENERAL () { return 0x1 },
  get ADMIN () { return 0x2 },
  get CONSOLE () { return 0x3 }
}

const checkPermission = function (user, guild, adminRoles, adminPermissions, adminUsers) {
  if (user === 'CONSOLE') {
    return FLAG.CONSOLE
  } else {
    let guildMember = guild.members.get(user.id)
    let r = FLAG.GENERAL
    for (let roleId of adminRoles) {
      if (guildMember.roles.has(roleId)) {
        r = FLAG.ADMIN
      }
    }
    if (guildMember.permissions.has(adminPermissions) || adminUsers.indexOf(user.id) !== -1) {
      r = FLAG.ADMIN
    }
    return r
  }
}

const validate = function (permission) {
  for (let flag in FLAG) {
    if (permission === FLAG[flag]) { return permission }
  }
  return null
}

class Command {
  constructor (action, help, permission) {
    this._commandPermission = FLAG.GENERAL
    this.action = action
    this.help = help || ''
    this.commandPermission = permission || FLAG.CONSOLE
  }

  get commandPermission () {
    return this._commandPermission
  }

  set commandPermission (value) {
    this._commandPermission = validate(value) || FLAG.CONSOLE
  }

  do (message, self) {
    if (this.commandPermission <= checkPermission(message.author, message.guild, self.config.adminRoles, self.config.adminPermissions, self.config.adminUsers)) {
      return this.action(message, self)
    } else if (self.config.displayChatErrors || message.author === 'CONSOLE') {
      return 'Invalid Permission!'
    } else {
      return null
    }
  }

  hasPermission (message, self) {
    return this.commandPermission <= checkPermission(message.author, message.guild, self.config.adminRoles, self.config.adminPermissions, self.config.adminUsers)
  }
}

module.exports = Command
module.exports.FLAG = FLAG
