/**
 * bot.js
 * The Bot object file. Contains all the behavior of engage-bot.
 */

// Requires
const Config = require('./config.js') // Config objects
const UserScore = require('./userscore.js') // UserScore objects
const Command = require('./command.js') // Command objects
const botconsole = require('./botconsole.js') // botconsole functions
const Discord = require('discord.js') // Discord.js library
const readline = require('readline') // Node readline library
const fs = require('fs') // Node filesystem library

// Functions

/**
 * Score a User based on their behavior
 * @param {Discord.User} user A Discord.User object containing the user to score
 * @param {String} type The type of action that triggered scoring
 * @param {Bot} self The Bot that scoring was triggered for
 */
const scoreUser = function (user, type, self) {
  if (!user.bot && self.config.scoring[type] !== 0) { // Ensure that the user is not a bot and the score for this action is not 0
    if (user.id in self.scores) { // If the score object has this user in it
      self.scores[user.id].score += self.config.scoring[type] // Increase score by scoring[type] points
      if ('bonus' in self.scores[user.id].inventory && self.scores[user.id].inventory['bonus'] + self.config.bonusInterval < Date.now()) { // If the user has a bonus value and the value is less than the current time
        getBonus(user, self) // Apply a bonus to the user
      } else if (!('bonus' in self.scores[user.id].inventory)) { // If they don't have a bonus yet
        getBonus(user, self) // Apply a bonus to the user
      }
    } else { // If the user doesn't have a score yet
      self.scores[user.id] = new UserScore(user.tag, self.config.scoring[type]) // Create the score with scoring[type] points
      getBonus(user, self) // Apply the bonus
    }
    botconsole.out(`${user.tag}'s score increased by ${self.config.scoring[type]}`) // Write score information to stdout
  }
}

/**
 * Apply a bonus to a user
 * @param {Discord.User} user A Discord.User object containing the user to apply a bonus to
 * @param {Bot} self The Bot that owns the scoring object for this user
 */
const getBonus = function (user, self) {
  if (self.config.bonus !== 0) { // If the bonus value is 0 do nothing
    self.scores[user.id].score += self.config.bonus // Apply the bonus to the user's score
    self.scores[user.id].inventory['bonus'] = Date.now() // Give the user a bonus object containing the current time in milliseconds
    botconsole.out(`DAILY BONUS: ${user.tag}'s score increased by ${self.config.bonus}`) // Write bonus information to stdout
  }
}

/**
 * Determine if message's author is a bot administrator
 * @param {Discord.Message} message The message to check the author of
 * @param {Bot} self The bot that the message belongs to
 * @return {Number} A flag value from Command.FLAG indicating the message author's permissions
 */
const isAdmin = function (message, self) {
  let r = Command.FLAG.GENERAL // Set r to GENERAL permissions
  if (message.channel && message.channel.type === 'text') { // If the message's channel exists and is a text channel
    let guildMember = message.guild.members.get(message.author.id) // Set guildMember to the guildMember object that contains this message's author
    for (let roleId of self.config.adminRoles) { // For every role id in adminRoles
      if (guildMember.roles.has(roleId)) { // If the guildMember has the current role
        r = Command.FLAG.ADMIN // Set r to ADMIN
      }
    }
    if (guildMember.permissions.has(self.config.adminPermissions) || self.config.adminUsers.indexOf(message.author.id) !== -1) { // If the guildMember has adminPermissions or their ID is in adminUsers
      r = Command.FLAG.ADMIN // Set r to ADMIN
    }
  }
  return r
}

/**
 * Convert a raw score object into a table of UserScores
 * @param {Object} scores A raw score object to parse
 * @return {Object} The input object after having been parsed
 */
const parseScores = function (scores) {
  for (let score in scores) { // For each score in the scores object
    scores[score] = new UserScore(scores[score].tag, scores[score].score, scores[score].inventory) // Set scores[score] to the a corresponding UserScore
  }
  return scores
}

/**
 * Defines the main behavior of engage-bot
 */
class Bot {
  /**
   * Construct a new Bot object
   * @param {Config} config A configuration object for this object to use
   * @param {Object} scores A raw score object to be parsed into the Bot's score table
   * @return {Bot} The newly contructed bot
   */
  constructor (config, scores) {
    this.rl = readline.createInterface({ // Create a new readline interface
      input: process.stdin, // Set input to stdin
      output: process.stdout // Set output to stdout
    })
    this.config = config || new Config() // Set the configuration or create a default configuration
    this.commands = require('./command-loader.js') // Load command modules
    this.client = new Discord.Client() // Create the client
    this.scores = parseScores(scores) || {} // Parse scores or set scores to an empty object
    this.voiceUsers = [] // Create array of users in voice chat

    this.client.on('ready', () => { // Trigger this event when the client logs in successfully
      botconsole.out('Login successful') // Output login message
      botconsole.out(`Starting ${this.config.name}...`) // Output startup message
      this.client.setInterval(function (data) { // Set a function for checking if users are in voice chat
        if (data.voiceUsers.length > 1) { // If more than one person is in voice chat
          for (let voiceUser of data.voiceUsers) { // For every voice user
            scoreUser(voiceUser.user, 'speaking', data) // Apply score to the user
          }
          data.rl.prompt() // Prompt stdin
        }
      }, this.config.speakingInterval, this)
      this.client.setInterval(function (data) { // Set a function for writing score data to the disk
        botconsole.out('Writing score data to disk...', true) // Write to stdout without a newline
        data.saveData() // Save data
        botconsole.out('Writing score data to disk...DONE!') // Output completed message
        data.rl.prompt() // Prompt stdin
      }, this.config.saveInterval, this)

      for (let guild of this.client.guilds.array()) { // For every guild this bot is a member of
        guild.members.get(this.client.user.id).setNickname(this.config.name) // Set this bot's name in the guild
      }

      for (let guild of this.client.guilds.array()) { // For every guild this bot is a member of
        for (let channel of guild.channels.array()) { // For every channel in the current guild
          if (channel.type === 'voice') { // If the channel is a voice channel
            for (let member of channel.members.array()) { // For every member of the channel
              if (!member.user.bot) { // If the member is not a bot
                this.voiceUsers.push(member) // Add this member to voiceUsers
                botconsole.out(`Voice user ${member.user.tag} found!`) // Output user found
              }
            }
          }
        }
      }
      this.rl.prompt() // Prompt stdin
    }).on('message', (message) => { // Trigger this event when this bot receives a message
      if (message.channel.type === 'text') { // If the message is from a text channel
        let response = this.handleCommand(message) // Try to handle it
        if (response) { // If the message was a command
          botconsole.out(`${message.channel.type === 'dm' || message.channel.type === 'group' ? 'DM: ' : ''}${isAdmin(message, this) > 1 ? '{ADMIN} ' : ''}${message.author.tag}: ${message.content}`) // Output message
          message.channel.send(`${message.author} ${response}`).catch(function (err) { // Send response but catch message errors
            botconsole.error(err) // Log errors
          })
        } else { // Otherwise
          if (this.config.logAllMessages || message.author.id === this.client.user.id) { // If all messages should be logged or this message is from this bot
            botconsole.out(`${message.channel.type === 'dm' || message.channel.type === 'group' ? 'DM: ' : ''}${isAdmin(message, this) > 1 ? '{ADMIN} ' : ''}${message.author.tag}: ${message.content}`) // Output message
          }
          scoreUser(message.author, 'message', this) // Score the user
          this.rl.prompt() // Prompt stdin
        }
      }
    }).on('typingStop', (channel, user) => { // Trigger this event when a user stops typing
      if (channel.type === 'text') { // If the channel for this event is a text channel
        scoreUser(user, 'typing', this) // Score the user
      }
      this.rl.prompt() // Prompt stdin
    }).on('voiceStateUpdate', (oldMember, newMember) => { // Trigger this even when a voice state update occurs
      if (newMember.voiceChannel) { // If the newMember has a voice channel
        if (this.voiceUsers.indexOf(newMember) === -1 && !newMember.user.bot) { // If the newMember is not in voice users and not a bot
          this.voiceUsers.push(newMember) // Add the member to voiceUsers
          botconsole.out(`${newMember.user.tag} joined ${newMember.voiceChannel}`) // Log member joined
        }
      } else { // Otherwise
        this.voiceUsers.splice(this.voiceUsers.indexOf(newMember), 1) // Remove member from voiceUsers
        botconsole.out(`${newMember.user.tag} left ${oldMember.voiceChannel}`) // Log member left
      }
      this.rl.prompt() // Prompt stdin
    }).on('disconnect', (event) => { // On WebSocket disconnection
      botconsole.error(`WebSocket Error ${event.code}: ${event.reason}`) // Log event
      process.exit(1) // Exit with an error code of 1
    })

    this.rl.on('line', (line) => { // Trigger this event when the administrator enters a command
      botconsole.out(this.handleCommand({ // handle this command and output the result
        content: line, // Set message content to the input
        author: 'CONSOLE' // Set message author to CONSOLE
      }))
      this.rl.prompt() // Prompt stdin
    }).on('close', () => { // Trigger this event when stdin is closed
      process.exit(0) // Exit
    })

    process.on('exit', () => { // Trigger this event when the program exits
      this.client.destroy() // Logout
      botconsole.out('Saving data....', true) // Log saving data
      this.saveData() // Save data
      botconsole.out('Saving data....DONE!') // Log done
      botconsole.out(`Exiting ${this.config.name} with code ${process.exitCode}`) // Log exit code
    })

    this.rl.setPrompt(`${this.config.name}> `) // Set the prompt text
  }

/**
 * Log in to Discord
 * @param {String} token The token to use during login
 */
  login (token) {
    let loginToken = token || this.config.token // Set loginToken to token or the token found in the current configuration
    if (loginToken) { // If the token is not empty
      this.client.login(loginToken).catch(function (err) { // Attempt login and catch errors
        botconsole.error(err) // Log errors
        process.exit(1) // Exit with an error code of 1
      })
    } else { // Otherwise
      botconsole.error('Login token invalid.') // Log invalid
      process.exit(1) // Exit with an error code of 1
    }
  }

  /**
   * Save data to disk
   * @param {String} path The path to save data to
   */
  saveData (path) {
    let savePath = path || './cache' // Set savePath to path or ./cache
    if (!fs.existsSync(savePath)) { // If the savePath doesn't exist
      fs.mkdirSync(savePath) // Make the savePath
    }
    fs.writeFileSync(`${savePath}/config.json`, JSON.stringify(this.config, null, ' ')) // Write the config to the disk
    if (fs.existsSync(`${savePath}/scores.json`)) { // If the scores file exists
      fs.writeFileSync(`${savePath}/scores.bak.json`, fs.readFileSync(`${savePath}/scores.json`)) // Copy current scores to backup
    }
    fs.writeFileSync(`${savePath}/scores.json`, JSON.stringify(this.scores, null, ' ')) // Write scores to disk
  }

  /**
   * Handle a message as a command to the bot
   * @param {Discord.Message} message The message to handle
   * @return {String} The response msessage if any
   */
  handleCommand (message) {
    if (new RegExp(`^${this.config.prefix}`, 'g').test(message.content) || message.author === 'CONSOLE') { // If message is a command
      let args = message.content.replace(`${this.config.prefix}`, '').split(/\s+/g) // Clean up message content and split
      if (args[0] in this.commands) { // If args[0] is a valid command
        message.content = message.content.replace(new RegExp(`^${message.author === 'CONSOLE' ? '' : this.config.prefix}${args[0]}`, 'g'), '').trim() // Clean message content and set content
        return this.commands[args[0]].do(message, this) // Return command result
      } else if (this.config.displayChatErrors || message.author === 'CONSOLE') { // Otherwise if the bot should display errors
        return 'Invalid Command!' // Return error message
      }
    } else { // Otherwise
      return null // Return nothing
    }
  }
}

module.exports = Bot
