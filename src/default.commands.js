const fs = require('fs')
const WebCommand = require('./webcommand.js')
const safeJSONStringify = require('safe-json-stringify')
const Utility = require('./utility.js')
const UserScore = require('./userscore.js')
const utils = new Utility()

var commandBundle = {
  webCommands: { },
  consoleCommands: { }
}

let alterScore = function (value, id, self) {
  if (!(id in self.scores)) {
    self.scores[id] = new UserScore(id !== self.client.user.id ? self.client.users.get(id).tag : self.client.user.tag)
  }
  self.scores[id].score = self.scores[id].score + self.validateScore(value)
}

// Assign Default WebCommands
Object.assign(commandBundle.webCommands, {
  log: new WebCommand(function (obj, author, self) {
    if (obj) {
      let objs = obj.split('.')
      let root = self[objs[0]]
      let props = objs.slice(1)
      let output = ''
      for (let prop of props) {
        if (root && prop in root) { root = root[prop] }
        else { root = undefined }
      }
      output = JSON.stringify(safeJSONStringify.ensureProperties(root), null, ' ') || 'undefined'
      if (output.length > 1900) { output = 'OUTPUT TOO LONG' }
      return `${author}\n\`\`\`json\n${output}\n\`\`\``
    }
  }, 'Log a property of this bot.\nArguments:\n`object`: The object to log in the format x.y.z etc.', true),
  ping: new WebCommand(function (message, author, self) {
    return `${author} ${self.client.ping.toFixed(2)}ms`
  }, 'Respond with the client ping in milliseconds.'),
  score: new WebCommand(function (message, author, self) {
    let args = message.trim().split(' ')
    let id = args.length > 0 ? args[0].trim().replace(/<@!?([^&]+)>/g, '$1') : ''
    if (id in self.scores) {
      return `${author} ${self.scores[id].tag} has ${self.scores[id].score} ${self.config.scoreUnit}`
    } else if (id) {
      return `${author} That user wasn't found or doesn't have a score yet!`
    } else {
      let output = author.id in self.scores ? self.scores[author.id].score : 0
      return `${author} You currently have ${output} ${self.config.scoreUnit}`
    }
  }, 'Display your current score or the score of a user you mention.\nArguments:\n`user`: The user whose score you want to see. If this is omitted your score will be displayed.'),
  top: new WebCommand(function (message, author, self) {
    let scoreBoard = []
    let output = `${author}\nTOP USERS:\n`
    for (let user in self.scores) {
      scoreBoard.push(self.scores[user])
    }
    scoreBoard.sort(function (a, b) {
      if (a.score > b.score) { return -1 }
      else if (a.score < b.score) { return 1 }
      else { return 0 }
    })
    for (let i = 0; i < (scoreBoard.length <= 10 ? scoreBoard.length : 10); ++i) {
      output += `${i + 1}. ${scoreBoard[i].tag} : ${scoreBoard[i].score} ${self.config.scoreUnit}\n`
    }
    return output || 'No scores yet!'
  }, 'Display the top 10 users of this server.'),
  add: new WebCommand(function (message, author, self) {
    let args = message.split(' ')
    if (args.length >= 2) {
      let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1')
      let parseValue = Number(args[1].trim())
      if (!id.match(/\D/g)) {
        alterScore(parseValue, id, self)
        utils.console_out(self.scores[id])
        return `${author} added ${parseValue} ${self.config.scoreUnit} to ${self.scores[id].tag}`
      }
    }
  }, 'Add score to a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to add.', true),
  subtract: new WebCommand(function (message, author, self) {
    let args = message.split(' ')
    if (args.length >= 2) {
      let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1')
      let parseValue = Number(args[1].trim())
      if (!id.match(/\D/g)) {
        alterScore(-parseValue, id, self)
        utils.console_out(self.scores[id])
        return `${author} subtracted ${parseValue} ${self.config.scoreUnit} from ${self.scores[id].tag}`
      }
    }
  }, 'Subtract score from a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to subtract.', true),
  set: new WebCommand(function (message, author, self) {
    let args = message.split(' ')
    if (args.length >= 2) {
      let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1')
      let parseValue = Number(args[1].trim())
      if (!id.match(/\D/g)) {
        if (id in self.scores) { self.scores[id].score = 0 }
        alterScore(parseValue, id, self)
        utils.console_out(self.scores[id])
        return `${author} set ${self.scores[id].tag}'s ${self.config.scoreUnit} to ${parseValue}`
      }
    }
  }, 'Set a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to set.', true),
  help: new WebCommand(function (message, author, self) {
    let output = ''
    for (let command in self.webCommands) {
      output += `\`${self.config.commandPrefix}${command}\` ${self.webCommands[command].admin ? '*ADMIN ONLY*' : ''}\n${self.webCommands[command].help}\n\n`
    }
    author.createDM().then(function (channel) {
      channel.send(output).catch(function (err) {
        utils.console_error(err)
        self._readLine.prompt()
      })
    })
    return `${author} Help is on the way!`
  }, 'Display this help message.'),
  about: new WebCommand(function (message, author, self) {
    return `\`\`\`\n${self.config.aboutMessage}\n\`\`\``
  }, 'Display information about this bot')
})

// Assign default console commands
Object.assign(commandBundle.consoleCommands, {
  log: function (obj, self) {
    if (obj) {
      let objs = obj.split('.')
      let root = self[objs[0]]
      let props = objs.slice(1)
      for (let prop of props) {
        if (root && prop in root) { root = root[prop] }
        else { root = undefined }
      }
      return root
    }
  },
  setChannel: function (id, self) {
    if (id && self.client.channels.get(id.trim()).type === 'text') {
      self.sayChannel = self.client.channels.get(id.trim())
      return `Say channel set to ${id}`
    }
  },
  sayTo: function (data, self) {
    data = data.split(' ')
    let channel = data[0].trim()
    let message = data.slice(1).join(' ').trim()
    for (let guild of self.client.guilds) {
      if (guild[1].name === channel) { self.sayChannel = guild[1].defaultChannel }
    }
    self.commands['say'](message)
  },
  say: function (message, self) {
    if (self.sayChannel) {
      self.sayChannel.send(message.trim() || self.config.defaultMessage)
      return undefined
    } else { return 'Channel Undefined' }
  },
  invite: function (message, self) {
    try {
      let permissions = message.split(' ').filter(function (perm) { return perm !== '' && perm !== ' ' })
      if (permissions.length === 0) {
        permissions = require('discord.js').Permissions.DEFAULT
      }
      self.client.generateInvite(permissions).then(function (link) {
        utils.console_out(link)
        self._readLine.prompt()
      }, function (err) {
        utils.console_error(err)
        self._readLine.prompt()
      })
    } catch (err) {
      utils.console_error(err)
      self._readLine.prompt()
    }
  },
  roleIds: function (message, self) {
    for (let guild of self.client.guilds.array()) {
      utils.console_out(`${guild.name}:`)
      for (let role of guild.roles.array()) {
        utils.console_out(`  ${role.name} : ${role.id}`)
      }
    }
  },
  'get-config': function (message, self) {
    let obj = message.trim()
    if (obj) { utils.console_out(self.config[obj]) }
    else { utils.console_out(self.config) }
  },
  'set-config': function (message, self) {
    let args = message.split(' ')
    if (args.length >= 2) {
      self.config[args[0].trim()] = args[1].trim()
    }
  },
  'leave-guild': function (message, self) {
    for (let guild of self.client.guilds.array()) {
      if (guild.name === message.trim()) { guild.leave() }
    }
  }
})

if (fs.existsSync('./cmd/web')) {
  for (let path of fs.readdirSync('./cmd/web')) {
    Object.assign(commandBundle.webCommands, require('../cmd/web/' + path))
  }
}

if (fs.existsSync('./cmd/console')) {
  for (let path of fs.readdirSync('./cmd/console')) {
    Object.assign(commandBundle.consoleCommands, require('../cmd/console/' + path))
  }
}

module.exports = commandBundle
