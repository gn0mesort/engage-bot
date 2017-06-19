/**
 * gift.js
 * Defines Commands related to giving inventory items and points to other users
 */

// Requires
const Command = require('../src/command.js') // Command objects
const UserScore = require('../src/userscore.js') // UserScore objects

module.exports = {
  /**
   * A command for giving points to another user
   */
  'give': new Command(function (message, self) {
    let args = message.content.split(/\s+/g) // Split arguments
    if (args.length >= 2) { // If there are enough arguments
      let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1') // Set the id equal to the first argument after parsing
      let value = Number(args[1].trim()) // Set value to the number input in the second argument
      if (message.author.id in self.scores && self.scores[message.author.id].score >= value && value > 0) { // If the author is in self.scores and has enough points and the value is greater than 0
        if (id in self.scores) { // If the id is already in self.scores
          self.scores[id].score += value // Add the given amount to the targetted user
          self.scores[message.author.id].score -= value // Subtract points from sender
          return `Gave ${value} ${self.config.unit} to ${args[0]}`
        } else if (message.guild.members.has(id)) { // If the id value is a member of the message's guild
          self.scores[id] = new UserScore(self.client.users.get(id).tag, value) // Create a new score for the user with the added value
          self.scores[message.author.id].score -= value // Subtract points from sender
          return `Gave ${value} ${self.config.unit} to ${args[0]}`
        } else { // Otherwise
          return 'That user doesn\'t have a score yet!'
        }
      } else if (value <= 0) { // If the value to give is less than or equal to 0
        return `You can't give fewer than 1 ${self.config.unit}!`
      } else { // Otherwise
        return `You don't have enough ${self.config.unit} to give that many!`
      }
    }
  },
  'Give a user points from your total.\nArguments:\n`user`: The @ name of the user to give points to.\n`value`: The number of points to give the mentioned user.',
  Command.FLAG.GENERAL)
}
