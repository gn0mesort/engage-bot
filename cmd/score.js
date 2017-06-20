/**
 * scores.js
 * Defines Commands related to scoring user interaction
 */

// Requires
const Command = require('../src/command.js') // Command objects
const UserScore = require('../src/userscore.js') // UserScore objects

module.exports = {
  /**
   * A command to display the message author's current score or the current score of another user
   */
  'score': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      let id = args.length > 0 ? args[0].trim().replace(/<@!?([^&]+)>/g, '$1') : '' // Clean user id if one is found
      if (id in self.scores) { // If the id was found
        return `${self.scores[id].tag} has ${self.scores[id].score} ${self.config.unit}` // Return the score of user indicated by the id
      } else if (id) { // If the id exists but wasn't found
        return `That user wasn't found or doesn't have a score yet!` // Error message
      } else if (message.author === 'CONSOLE') { // If the message came from the console
        return 'The console doesn\'t have a score.' // Error message
      } else { // Otherwise
        let output = message.author.id in self.scores ? self.scores[message.author.id].score : 0 // Return the author's score
        return `You currently have ${output} ${self.config.unit}`
      }
    },
    'Display your current score or the score of a user you mention.\nArguments:\n`user`: The user whose score you want to see. If this is omitted your score will be displayed.',
    Command.FLAG.GENERAL
  ),
  /**
   * A command to add score to a specific user
   */
  'add': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      if (args.length >= 2) { // If there are 2 or more arguments
        let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1') // Set the id equal to the first argument after parsing
        let value = Number(args[1].trim()) // Set value to the number input in the second argument
        if (self.client.users.has(id) || message.guild.members.has(id)) { // If the user is known to the bot or is in the message's guild
          if (id in self.scores) { // If id is in self.scores
            self.scores[id].score += value // Add the value
          } else { // Otherwise
            self.scores[id] = new UserScore(self.client.users.get(id).tag, value) // Create a new score for the user with the added value
          }
          return `added ${UserScore.validate(value)} ${self.config.unit} to ${self.scores[id].tag}`
        }
      }
      return `Can't add ${self.config.unit} to that user!` // Return an error otherwise
    },
    'Add score to a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to add.',
    Command.FLAG.ADMIN
  ),
  /**
   * A command to subtract score from a specific user
   */
  'subtract': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      if (args.length >= 2) { // If there are 2 or more arguments
        let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1') // Set the id equal to the first argument after parsing
        let value = Number(args[1].trim()) // Set value to the number input in the second argument
        if (self.client.users.has(id) || message.guild.members.has(id)) { // If the user is known to the bot or is in the message's guild
          if (id in self.scores) { // If id is in self.scores
            self.scores[id].score -= value // Subtract the value
          } else { // Otherwise
            self.scores[id] = new UserScore(self.client.users.get(id).tag, -value) // Create a new score for the user with the subtracted value
          }
          return `subtracted ${UserScore.validate(value)} ${self.config.unit} from ${self.scores[id].tag}`
        }
      }
      return `Can't subtract ${self.config.unit} from that user!` // Otherwise return an error
    },
    'Subtract score from a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to subtract.',
    Command.FLAG.ADMIN
  ),
  /**
   * Set a specific user's score to a given value
   */
  'set': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      if (args.length >= 2) { // If there are 2 or more arguments
        let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1') // Set the id equal to the first argument after parsing
        let value = Number(args[1].trim()) // Set value to the number input in the second argument
        if (self.client.users.has(id) || message.guild.members.has(id)) { // If the user is known to the bot or is in the message's guild
          if (id in self.scores) { // If id is in self.scores
            self.scores[id].score = value // Set the value
          } else { // Otherwise
            self.scores[id] = new UserScore(self.client.users.get(id).tag, value) // Create a new score with the given value
          }
          return `set ${self.scores[id].tag}'s ${self.config.unit} to ${UserScore.validate(value)}`
        }
      }
      return `Can't set ${self.config.unit} for that user!` // Otherwise return an error
    },
    'Set a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to set.',
    Command.FLAG.ADMIN
  ),
  /**
   * A command that displays the top scores in the score table
   */
  'top': new Command(
    function (message, self) {
      let scoreBoard = [] // Create a scoreboard array
      let output = '\nTOP USERS:\n' // Set initial output
      for (let user in self.scores) { // For each user in the score table
        scoreBoard.push(self.scores[user]) // Add the user to the scoreboard
      }
      scoreBoard.sort(function (a, b) { // Sort the scoreboard
        if (a.score > b.score) { // If the last value is greater than the current value
          return -1
        } else if (a.score < b.score) { // If the last value is less than the current value
          return 1
        } else { // Otherwise
          return 0
        }
      })
      for (let i = 0; i < (scoreBoard.length <= 10 ? scoreBoard.length : 10); ++i) { // For the first 10 users in the scoreboard
        output += `${i + 1}. ${scoreBoard[i].tag} : ${scoreBoard[i].score} ${self.config.unit}\n` // Add the user to the output
      }
      return output || 'No scores yet!' // Return the output or an error message
    },
    'Display the top 10 users of this server.',
    Command.FLAG.GENERAL
  ),
  /**
   * A command for displaying bonus information
   */
  'bonus': new Command(
    function (message, self) {
      if (message.author.id in self.scores) { // If the message author has a score
        if ('bonus' in self.scores[message.author.id].inventory) { // If the message author has a bonus value
          return `The bonus is ${self.config.scoring.bonus} ${self.config.unit}.\nYou received your last bonus at ${new Date(self.scores[message.author.id].inventory['bonus']).toUTCString()}!\nYou may earn another bonus at ${new Date(self.scores[message.author.id].inventory['bonus'] + self.config.intervals.bonus).toUTCString()}!` // Return information about the message author's bonus
        } else { // Otherwise
          return 'You have not yet earned a bonus!' // No bonus
        }
      } else if (message.author === 'CONSOLE') { // If the message author was the console
        return `The bonus is ${self.config.scoring.bonus} ${self.config.unit}.\nYou may earn it every ${self.config.intervals.bonus}ms.` // Return generic bonus info
      } else { // Otherwise
        return 'You have not yet earned a bonus!' // No bonus
      }
    },
    'Display information about bonuses.',
    Command.FLAG.GENERAL
  ),
  /**
   * A command that displays the bot's current scoring informations
   */
  'scoring': new Command(
    function (message, self) {
      let output = '' // Set output to ''
      for (let value in self.config.scoring) { // For every value in the scoring table
        if (value in self.config.intervals) { // If the value has a corresponding interval
          if (self.config.isValidInterval(self.config.intervals[value])) { // If the interval is valid
            output += `${value}: ${self.config.scoring[value]} ${self.config.unit} / ${self.config.intervals[value]}ms\n` // Add output with interval info
          } else { // Otherwise
            output += `${value}: ${self.config.scoring[value]} ${self.config.unit} [INTERVAL DISABLED]\n` // Show that the interval is disabled
          }
        } else { // Otherwise
          output += `${value}: ${self.config.scoring[value]} ${self.config.unit}\n` // Output just the score information
        }
      }
      return message.author === 'CONSOLE' ? output : `\`\`\`\n${output}\n\`\`\`` // Return block text if the message came from Discord
    },
    'Display a table of actions and their scores.',
    Command.FLAG.GENERAL
  )
}
