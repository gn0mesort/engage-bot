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
      if ('bonus' in self.scores[user.id].inventory && self.scores[user.id].inventory['bonus'] + self.config.intervals.bonus < Date.now()) { // If the user has a bonus value and the value is less than the current time
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
  if (self.config.scoring.bonus !== 0 && self.config.isValidInterval(self.config.intervals.bonus)) { // If the bonus value is 0 or the bonus interval isn't valid do nothing
    self.scores[user.id].score += self.config.scoring.bonus // Apply the bonus to the user's score
    self.scores[user.id].inventory['bonus'] = Date.now() // Give the user a bonus object containing the current time in milliseconds
    botconsole.out(`BONUS: ${user.tag}'s score increased by ${self.config.scoring.bonus}`) // Write bonus information to stdout
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
    scores[score] = new UserScore(scores[score].tag, scores[score].score, scores[score].inventory, scores[score].update) // Set scores[score] to the a corresponding UserScore
  }
  return scores
}

/**
 * Add a user to the voiceUsers table
 * @param {Discord.GuildMember} guildMember The guildMember that represents the user to add
 * @param {Bot} self The current bot instance
 */
const addVoiceUser = function (guildMember, self) {
  if (!guildMember.selfDeaf && !guildMember.serverDeaf) { // If not deafened
    if (guildMember.voiceChannelID in self.voiceUsers && self.voiceUsers[guildMember.voiceChannelID].indexOf(guildMember) === -1) { // If the channel is already in the table and guildMember is not in voiceUsers
      self.voiceUsers[guildMember.voiceChannelID].push(guildMember) // Push guildMember into the correct channel
      botconsole.out(`${guildMember.user.tag} joined ${guildMember.voiceChannel}`) // Log member joined
    } else if (!(guildMember.voiceChannelID in self.voiceUsers)) { // Otherwise if the channel isn't in the table
      self.voiceUsers[guildMember.voiceChannelID] = [guildMember] // Create the channel and add guildMember
      botconsole.out(`${guildMember.user.tag} joined ${guildMember.voiceChannel}`) // Log member joined
    }
  }
}

/**
 * Remove a user from the voiceUsers table
 * @param {Discord.GuildMember} guildMember The GuildMember that represents the user to remove
 * @param {Discord.VoiceChannel} channel The channel to remove the user from
 * @param {Bot} self The current bot instance
 */
const removeVoiceUser = function (guildMember, channel, self) {
  if (channel && channel.id in self.voiceUsers) { // Ensure that the channel exists and is in the voiceUsers table
    let index = self.voiceUsers[channel.id].indexOf(guildMember) // Get the index of the user
    if (index !== -1) { // If the user was in the channel
      self.voiceUsers[channel.id].splice(index, 1) // Remove the user
      botconsole.out(`${guildMember.user.tag} left ${channel}`) // Log member left
    }
  }
}

/**
 * Defines the main behavior of engage-bot
 */
class Bot {
  /**
   * Construct a new Bot object
   * @param {Config} config A configuration object for this object to use
   * @param {Object} scores A raw score object to be parsed into the Bot's score table
   * @param {Object} data A table of data values to use for this Bot
   * @return {Bot} The newly contructed bot
   */
  constructor (config, scores, data) {
    this.config = config || new Config() // Set the configuration or create a default configuration
    this.commands = require('./command-loader.js') // Load command modules
    this.client = new Discord.Client() // Create the client
    this.scores = parseScores(scores) || {} // Parse scores or set scores to an empty object
    this.voiceUsers = {} // Create a table of users in voice chat
    this.data = data || {} // Create a table of temporary data values for use by command modules
    this.data.blacklist = data.blacklist || [] // The proper blacklist contains both explicitly banned users and users banned via input
    this.version = JSON.parse(fs.readFileSync('./package.json')).version // Set version number

    this.client.on('ready', () => { // Trigger this event when the client logs in successfully
      botconsole.out('Login successful') // Output login message
      if (botconsole.isTty) { // If the console is a tty
        botconsole.out(`Starting ${this.config.name}...`, true) // Output startup message
      }

      if (this.config.isValidInterval(this.config.intervals.speaking)) { // If speaking checks are enabled
        this.client.setInterval(() => { // Set a function for checking if users are in voice chat
          for (let channel in this.voiceUsers) { // For every channel in voiceUsers
            if (this.voiceUsers[channel].length > 1) { // If the channel has more than one member
              for (let voiceUser of this.voiceUsers[channel]) { // For every member of the channel
                scoreUser(voiceUser.user, 'speaking', this) // Score the user
              }
            }
          }
          botconsole.prompt() // Prompt stdin
        }, this.config.intervals.speaking)
      }
      if (this.config.isValidInterval(this.config.intervals.save)) { // If automatic saving is enabled
        this.client.setInterval(() => { // Set a function for writing score data to the disk
          if (botconsole.isTty) { // If the console is a tty
            botconsole.out('Writing score data to disk...', true) // Write to stdout without a newline
          }
          this.saveData() // Save data
          botconsole.out('Writing score data to disk...DONE!') // Output completed message
          botconsole.prompt() // Prompt stdin
        }, this.config.intervals.save)
      }
      if (this.config.isValidInterval(this.config.intervals.prune)) { // If score pruning is enabled
        this.client.setInterval(() => { // Set a function for pruning the scores
          this.pruneTable() // Prune the scores
          botconsole.prompt() // Prompt stdin
        }, this.config.intervals.prune)
        this.pruneTable() // Clear any expired scores at start up
      }

      for (let guild of this.client.guilds.array()) { // For every guild this bot is a member of
        guild.members.get(this.client.user.id).setNickname(this.config.name) // Set this bot's name in the guild
      }

      for (let guild of this.client.guilds.array()) { // For every guild this bot is a member of
        for (let channel of guild.channels.array()) { // For every channel in the current guild
          if (channel.type === 'voice') { // If the channel is a voice channel
            this.voiceUsers[channel.id] = []
            for (let member of channel.members.array()) { // For every member of the channel
              if (!member.user.bot && !member.selfDeaf && !member.serverDeaf) { // If the member is not a bot or deafened
                this.voiceUsers[channel.id].push(member) // Add this member to voiceUsers
                botconsole.out(`Voice user ${member.user.tag} found!`) // Output user found
              }
            }
          }
        }
      }
      this.client.user.setGame(`v${this.version}`) // Display current Bot version as status

      botconsole.out(`Starting ${this.config.name}...DONE!`) // Finished Startup
      botconsole.out(`Version: ${this.version}\nType \`help\` for commands`)
      botconsole.prompt() // Prompt stdin
    }).on('message', (message) => { // Trigger this event when this bot receives a message
      if (message.channel.type === 'text' && (isAdmin(message, this) > 1 || this.data.blacklist.indexOf(message.author.id) === -1)) { // If the message is from a text channel and the user isn't banned
        let content = message.content // Cache message content for output
        let response = this.handleCommand(message) // Try to handle it
        if (response) { // If the message was a command
          let splitOptions = {}
          if (response.trim().startsWith('```')) {
            let type = response.trim().split('\n')[0].split('`')[3]
            splitOptions.prepend = `\`\`\`${type}\n`
            splitOptions.append = '```'
          } else {
            splitOptions = true
          }
          botconsole.out(`${message.channel.type === 'dm' || message.channel.type === 'group' ? 'DM: ' : ''}${isAdmin(message, this) > 1 ? '{ADMIN} ' : ''}${message.author.tag}: ${content}`) // Output message
          message.channel.send(`${message.author} ${response}`, {split: splitOptions}).catch(function (err) { // Send response but catch message errors
            botconsole.error(err) // Log errors
          })
        } else { // Otherwise
          if (this.config.logAllMessages || message.author.id === this.client.user.id) { // If all messages should be logged or this message is from this bot
            botconsole.out(`${message.channel.type === 'dm' || message.channel.type === 'group' ? 'DM: ' : ''}${isAdmin(message, this) > 1 ? '{ADMIN} ' : ''}${message.author.tag}: ${content}`) // Output message
          }
          scoreUser(message.author, 'message', this) // Score the user
          botconsole.prompt() // Prompt stdin
        }
      }
    }).on('typingStop', (channel, user) => { // Trigger this event when a user stops typing
      if (channel.type === 'text') { // If the channel for this event is a text channel
        scoreUser(user, 'typing', this) // Score the user
      }
      botconsole.prompt() // Prompt stdin
    }).on('voiceStateUpdate', (oldMember, newMember) => { // Trigger this event when a voice state update occurs
      if (newMember.voiceChannel && !oldMember.voiceChannel) { // If the newMember has a voice channel
        addVoiceUser(newMember, this) // Attempt to add the user
      } else if (newMember.voiceChannel && oldMember.voiceChannel && newMember.voiceChannelID !== oldMember.voiceChannelID) { // If the user has changed channels
        removeVoiceUser(newMember, oldMember.voiceChannel, this) // Remove the user from the old channel
        addVoiceUser(newMember, this) // Add the user to the new channel
      } else if (!newMember.voiceChannel && oldMember.voiceChannel) { // Otherwise if the user no longer has a channel
        removeVoiceUser(newMember, oldMember.voiceChannel, this) // Remove the user
      }
      if (newMember.voiceChannel && newMember.selfDeaf || newMember.serverDeaf) { // If the user is in a voice chat but deafened
        removeVoiceUser(newMember, newMember.voiceChannel, this) // Remove the user
      } else if (newMember.voiceChannel) { // Otherwise if the user is not deafened
        addVoiceUser(newMember, this) // Attempt to add the user
      }

      botconsole.prompt() // Prompt stdin
    }).on('disconnect', (event) => { // Trigger this event on WebSocket disconnection
      botconsole.error(`WebSocket Error ${event.code}: ${event.reason}`) // Log event
      process.exit(1) // Exit with an error code of 1
    }).on('channelDelete', (channel) => { // Trigger this event when a channel is deleted
      if (channel.id in this.voiceUsers) { // If the channel was in the voiceUsers table
        this.voiceUsers[channel.id] = [] // Clear the channel
      }
    }).on('error', (err) => { // Trigger this event on Client Error
      botconsole.error(err) // Log error
      botconsole.prompt() // Prompt stdin
    })

    botconsole.rl.on('line', (line) => { // Trigger this event when the administrator enters a command
      try { // Try to handle message
        botconsole.out(this.handleCommand({ // handle this command and output the result
          content: line, // Set message content to the input
          author: 'CONSOLE' // Set message author to CONSOLE
        }))
      } catch (err) { // Catch errors
        botconsole.error(err) // Log errors
      }
      botconsole.prompt() // Prompt stdin
    }).on('close', () => { // Trigger this event when stdin is closed
      process.exit(0) // Exit
    })

    process.on('exit', () => { // Trigger this event when the program exits
      this.client.destroy() // Logout
      if (botconsole.isTty) { // If the console is a tty
        botconsole.out('Saving data....', true) // Log saving data
      }
      this.saveData() // Save data
      botconsole.out('Saving data....DONE!') // Log done
      botconsole.out(`Exiting ${this.config.name} with code ${process.exitCode}`) // Log exit code
    }).on('SIGINT', () => {
      this.client.destroy() // Logout
      this.saveData() // Save data
    })

    botconsole.rl.setPrompt(`${this.config.name}> `) // Set the prompt text
    for (let id of this.config.blacklist) { // For every id in the explicit blacklist
      if (this.data.blacklist.indexOf(id) === -1) { // If the id isn't in the data blacklist
        this.data.blacklist.push(id) // Add the id to the blacklist
      }
    }
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
    fs.writeFileSync(`${savePath}/data.json`, JSON.stringify(this.data, null, ' ')) // Write data to the disk
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

  /**
   * Delete a specific value from the scores table
   * @param {String} id A valid user id found in the score's table to delete
   * @return {Boolean} Whether or no the value was deleted
   */
  prune (id) {
    if (id in this.scores) {
      botconsole.out(`Deleting ${this.scores[id].tag} from table with a score of ${this.scores[id].score} ${this.config.unit}!`) // Output deletion message
      return delete this.scores[id]
    }
    return false
  }

  /**
   * Prune expired values in the scores table
   */
  pruneTable () {
    for (let user in this.scores) { // For every stored UserScore
      if (this.scores[user].update + this.config.intervals.prune < Date.now() || (this.scores[user].score === 0 && Object.keys(this.scores[user].inventory).length === 0)) { // If the score has expired or is 0 and has no inventory
        botconsole.out(`Deleting ${this.scores[user].tag} from table with a score of ${this.scores[user].score} ${this.config.unit}!`) // Output deletion message
        delete this.scores[user] // Delete the score
      }
    }
  }
}

module.exports = Bot
