const Config = require('./config.js')
const UserScore = require('./userscore.js')
const Command = require('./command.js')
const botconsole = require('./botconsole.js')
const Discord = require('discord.js')
const readline = require('readline')
const fs = require('fs')

const scoreUser = function (user, type, self) {
  if (!user.bot) {
    if (user.id in self.scores) {
      self.scores[user.id].score += self.config.scoring[type]
    } else {
      self.scores[user.id] = new UserScore(user.tag, self.config.scoring[type])
    }
    botconsole.out(`${user.tag}'s score increased by ${self.config.scoring[type]}`)
  }
}

const isAdmin = function (message, self) {
  let r = Command.FLAG.GENERAL
  if (message.channel && message.channel.type === 'text') {
    let guildMember = message.guild.members.get(message.author.id)
    for (let roleId of self.config.adminRoles) {
      if (guildMember.roles.has(roleId)) {
        r = Command.FLAG.ADMIN
      }
    }
    if (guildMember.permissions.has(self.config.adminPermissions) || self.config.adminUsers.indexOf(message.author.id) !== -1) {
      r = Command.FLAG.ADMIN
    }
  }
  return r
}

const parseScores = function (scores) {
  for (let score in scores) {
    scores[score] = new UserScore(scores[score].tag, scores[score].score, scores[score].inventory)
  }
  return scores
}

class Bot {
  constructor (config, scores) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    this.config = config || new Config()
    this.commands = require('./command-loader.js')
    this.client = new Discord.Client()
    this.scores = parseScores(scores) || {}
    this.voiceUsers = []

    this.client.on('ready', () => {
      botconsole.out('Login successful')
      botconsole.out(`Starting ${this.config.name}...`)
      this.client.setInterval(function (data) {
        if (data.voiceUsers.length > 1) {
          for (let voiceUser of data.voiceUsers) {
            scoreUser(voiceUser.user, 'speaking')
          }
          data.rl.prompt()
        }
      }, this.config.speakingInterval, this)
      this.client.setInterval(function (data) {
        botconsole.out('Writing score data to disk...', true)
        data.saveData()
        botconsole.out('Writing score data to disk...DONE!')
        data.rl.prompt()
      }, this.config.saveInterval, this)

      for (let guild of this.client.guilds.array()) {
        guild.members.get(this.client.user.id).setNickname(this.config.name)
      }

      for (let guild of this.client.guilds.array()) {
        for (let channel of guild.channels.array()) {
          if (channel.type === 'voice') {
            for (let member of channel.members.array()) {
              this.voiceUsers.push(member)
              botconsole.out(`Voice user ${member.user.tag} found!`)
            }
          }
        }
      }
      this.rl.prompt()
    }).on('message', (message) => {
      let content = message.content
      if (message.channel.type === 'text') {
        let response = this.handleCommand(message)
        if (response) {
          botconsole.out(`${message.channel.type === 'dm' || message.channel.type === 'group' ? 'DM: ' : ''}${isAdmin(message, this) > 1 ? '{ADMIN} ' : ''}${message.author.tag}: ${content}`)
          message.channel.send(`${message.author} ${response}`)
        } else {
          if (this.config.logAllMessages || message.author.id === this.client.user.id) {
            botconsole.out(`${message.channel.type === 'dm' || message.channel.type === 'group' ? 'DM: ' : ''}${isAdmin(message, this) > 1 ? '{ADMIN} ' : ''}${message.author.tag}: ${content}`)
          }
          scoreUser(message.author, 'message', this)
          this.rl.prompt()
        }
      }
    }).on('typingStop', (channel, user) => {
      if (channel.type === 'text') {
        scoreUser(user, 'typing', this)
      }
      this.rl.prompt()
    }).on('voiceStatusUpdate', function (oldMember, newMember) {
      if (newMember.voiceChannel) {
        if (this.voiceUsers.indexOf(newMember) === -1) {
          this.voiceUsers.push(newMember)
          botconsole.out(`${newMember.user.tag} joined ${newMember.voiceChannel}`)
        }
      } else {
        this.voiceUsers.splice(this.voiceUsers.indexOf(newMember), 1)
        botconsole.out(`${newMember.user.tag} left ${oldMember.voiceChannel}`)
      }
      this.rl.prompt()
    })

    this.rl.on('line', (line) => {
      botconsole.out(this.handleCommand({
        content: line,
        author: 'CONSOLE'
      }))
      this.rl.prompt()
    }).on('close', () => {
      process.exit(0)
    })

    process.on('exit', () => {
      this.client.destroy()
      botconsole.out('Saving data....', true)
      this.saveData()
      botconsole.out('Saving data....DONE!')
      botconsole.out(`Exiting ${this.config.name} with code ${process.exitCode}`)
    })

    this.rl.setPrompt(`${this.config.name}> `)
  }

  login (token) {
    let loginToken = token || this.config.token
    if (loginToken) {
      this.client.login(loginToken)
    } else {
      botconsole.error('Login token invalid.')
      process.exit(1)
    }
  }

  saveData (path) {
    let savePath = path || './cache'
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath)
    }
    fs.writeFileSync(`${savePath}/config.json`, JSON.stringify(this.config, null, ' '))
    if (fs.existsSync(`${savePath}/scores.json`)) {
      fs.writeFileSync(`${savePath}/scores.bak.json`, fs.readFileSync(`${savePath}/scores.json`))
    }
    fs.writeFileSync(`${savePath}/scores.json`, JSON.stringify(this.scores, null, ' '))
  }

  handleCommand (message) {
    if (new RegExp(`^${this.config.prefix}`, 'g').test(message.content) || message.author === 'CONSOLE') {
      let args = message.content.replace(`${this.config.prefix}`, '').split(/\s+/g)
      if (args[0] in this.commands) {
        message.content = message.content.replace(new RegExp(`^${message.author === 'CONSOLE' ? '' : this.config.prefix}${args[0]}`, 'g'), '').trim()
        return this.commands[args[0]].do(message, this)
      } else if (this.config.displayChatErrors || message.author === 'CONSOLE') {
        return 'Invalid Command!'
      }
    } else {
      return null
    }
  }
}

module.exports = Bot
