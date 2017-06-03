const Config = require('./config.js')
const Utility = require('./utility.js')
const UserScore = require('./userscore.js')
const Discord = require('discord.js')
const readline = require('readline')
const fs = require('fs')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'engage-bot> '
})
const utils = new Utility()

var Bot = function (config) {
  let self = this
  let tickCount = 0
  this._readLine = rl
  this.config = config || new Config()
  this.voiceUsers = []
  this.scores = null
  this.commands = require('./default.commands.js').consoleCommands
  this.webCommands = require('./default.commands.js').webCommands
  this.client = new Discord.Client()
  this.sayChannel = null
  this.handleCommand = function (line) {
    let cmdArgs = line.split(' ')
    if (cmdArgs[0].trim() in self.commands) {
      let output = self.commands[cmdArgs[0].trim()](cmdArgs.slice(1).join(' '), self)
      if (output) { utils.console_out(output) }
    }
    else { utils.console_error(`Invalid input: ${line}`) }
    rl.prompt()
  }
  this.handleWebCommand = function (message) {
    let r = ''
    let cmdArgs = message.content.replace(self.config.commandPrefix, '').split(' ')
    let cmd = cmdArgs[0].trim()
    if (cmd && cmd in self.webCommands) {
      if (!self.webCommands[cmd].admin || self.isAdmin(message)) { r = self.webCommands[cmd].action(cmdArgs.slice(1).join(' '), message.author, self) }
      else if (self.webCommands[cmd].admin) { r = `${message.author} Invalid permissions` }
    } else { r = `${message.author} Invalid input: ${message}` }
    return r
  }
  this.isAdmin = function (message) {
    let r = false
    if (message.channel.type === 'text') {
      let guildMember = message.guild.members.get(message.author.id)
      for (let roleId of self.config.adminRoles) {
        r |= guildMember.roles.has(roleId)
      }
      if (guildMember.permissions.has(self.config.adminPermissions)) { r = true }
      else if (self.config.adminUsers.indexOf(message.author.id) !== -1) { r = true }
    }
    return r
  }
  this.login = function (token) {
    let loginToken = token || self.config.token
    if (loginToken && loginToken !== '') { self.client.login(loginToken) }
    else {
      utils.console_error('Login token invalid')
      rl.close()
    }
  }
  this.validateScore = function (value) {
    let r = value
    if (!Number.isFinite(value) && value > 0) { r = Number.MAX_SAFE_INTEGER }
    else if (!Number.isFinite(value) && value < 0) { r = Number.MIN_SAFE_INTEGER }
    else if (!Number.isFinite(value)) { r = 0 }
    return r
  }
  this.autoScore = function (user, type) {
    if (!user.bot) {
      if (!(user.id in self.scores)) { self.scores[user.id] = new UserScore(self.client.users.get(user.id).tag) }
      self.scores[user.id].score += self.validateScore(self.config.scoring[type])
      utils.console_out(`${user.tag}'s score increased by ${self.config.scoring[type]}`)
    }
  }

  this.client.on('ready', function () {
    self.client.setInterval(function (users) {
      if (users.length > 0) {
        for (let user of users) {
          self.autoScore(user.user, 'speaking')
        }
        rl.prompt()
      }
      if (tickCount === 6) {
        utils.console_out('Writing score data to disk...')
        fs.writeFileSync('./scores.json', JSON.stringify(self.scores, null, ' '))
        tickCount = 0
        utils.console_out('DONE!')
        rl.prompt()
      } else { ++tickCount }
    }, 10000, self.voiceUsers)
    self.sayChannel = self.client.guilds.first().defaultChannel
    for (let guild of self.client.guilds.array()) {
      guild.members.get(self.client.user.id).setNickname(self.config.botName)
    }
    for (let guild of self.client.guilds.array()) {
      for (let channel of guild.channels.array()) {
        if (channel.type === 'voice') {
          for (let member of channel.members.array()) {
            self.voiceUsers.push(member)
            utils.console_out(`Voice user ${member.user.tag} found!`)
          }
        }
      }
    }
    self.scores = fs.existsSync('./scores.json') ? JSON.parse(fs.readFileSync('./scores.json', 'utf8')) : {}
    utils.console_out(`${self.config.botName} started!`)
    if (self.config.avatarPath) {
      self.client.user.setAvatar(self.config.avatarPath).catch(function (err) {
        utils.console_error(err)
        rl.prompt()
      })
    }
    rl.prompt()
  }).on('disconnect', function (error) {
    utils.console_error(error.reason)
    rl.close()
  }).on('message', function (message) {
    let test = new RegExp(`^${self.config.commandPrefix}`, 'g').test(message.content)
    if (self.config.displayAllMessages || test || message.author === self.client.user) {
      utils.console_out(`${self.isAdmin(message) ? '{ADMIN} ' : ''}${message.author.tag}: ${message.content}`)
      if (test) {
        message.channel.send(self.handleWebCommand(message)).catch(function (err) {
          utils.console_error(err)
          rl.prompt()
        })
      }
    }
    if (!test) { self.autoScore(message.author, 'message') }
    rl.prompt()
  }).on('typingStop', function (channel, user) {
    self.autoScore(user, 'typing')
    rl.prompt()
  }).on('voiceStateUpdate', function (oldMember, newMember) {
    if (newMember.voiceChannel) {
      if (self.voiceUsers.indexOf(newMember) === -1) {
        self.voiceUsers.push(newMember)
        utils.console_out(`${newMember.user.tag} joined ${newMember.voiceChannel}`)
      }
    } else {
      self.voiceUsers.splice(self.voiceUsers.indexOf(newMember), 1)
      utils.console_out(`${newMember.user.tag} left ${oldMember.voiceChannel}`)
    }
    rl.prompt()
  })
  rl.on('line', function (line) {
    self.handleCommand(line)
    rl.prompt()
  }).on('close', function () {
    utils.console_out(`\nExiting ${self.config.botName}...`)
    fs.writeFileSync('./config.json', JSON.stringify(self.config, null, ' '))
    if (self.scores) { fs.writeFileSync('./scores.json', JSON.stringify(self.scores, null, ' ')) }
    self.client.destroy()
    process.exit(0)
  })

  rl.setPrompt(`${self.config.botName}> `)
}

module.exports = Bot
