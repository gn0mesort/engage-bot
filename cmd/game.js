/**
 * game.js
 * Define commands which are part of related to games that affect UserScores
 */

// Requires
const Command = require('../src/command.js') // Command objects
const UserScore = require('../src/userscore.js') // UserScore objects

/**
 * Generate a random number between low and high
 * @param {Number} low The lower bound to use. Defaults to 0
 * @param {Number} high The upper bound to use. Defaults to Number.MAX_SAFE_INTEGER
 * @return {Number} The generated number
 */
const random = function (low, high) {
  if (!low || low < 0) { // If low is undefined or less than 0
    low = 0 // Set low to 0
  }
  if (!high || high > Number.MAX_SAFE_INTEGER) { // If high is undefined or greater than Number.MAX_SAFE_INTEGER
    high = Number.MAX_SAFE_INTEGER // Set high to Number.MAX_SAFE_INTEGER
  }
  return Math.floor(Math.random() * (high - low) + low) // Return a random value between low and high
}

module.exports = {
  /**
   * A command for playing a slot machine game
   */
  'slots': new Command(function (message, self) {
    let wheel = self.config.commandConfigs.slots.wheel // Simplify wheel name
    let factor = self.config.commandConfigs.slots.scoreFactor // Simplify factor name
    let wheelCount = self.config.commandConfigs.slots.wheelCount // Simplify wheelCount name
    let args = message.content.split(/\s+/g) // Split arguements
    if (args.length > 0) { // If there are arguments
      let value = UserScore.validate(Number(args[0])) // Set value to the parsed and validated value of the first argument
      let output = '\nRESULTS:\n\n'
      if (message.author.id in self.scores && value <= self.scores[message.author.id].score && value > 0) { // If the author has a score and they're betting between 0 and their current score value
        let results = [] // Initialize results to an empty array
        let matches = 0 // Set matches to 0
        self.scores[message.author.id].score -= value // Subtract the bet
        for (let i = 0; i < wheelCount; ++i) { // Generate 4 random wheel values
          results.push(random(0, wheel.length)) // Push each value into results
          output += `${wheel[results[i]]}    `
        }
        for (let i = 1; i < wheelCount; ++i) { // For every result starting with the second one
          if (results[i] === results[i - 1]) { // If the current result matches the last result
            ++matches // Increment matches
          }
        }
        if (matches > 0) { // If matches were found
          self.scores[message.author.id].score += value * (1 + (matches * factor)) // Add winnings
        }
        return `${output}\n\n${matches > 0 ? 'You won' : 'You lost'} ${matches > 0 ? UserScore.validate(value * (1 + (matches * factor))) : value} ${self.config.unit}!` // Output results
      } else if (value <= 0) { // If the value was 0 or less
        return `You must bet at least 1 ${self.config.unit}!`
      } else { // Otherwise
        return `You do not have enough to bet ${value} ${self.config.unit}!`
      }
    }
  },
  'Play a slot machine game!\nArguments:\n`value`: The amount you wish to bet on the game.',
  Command.FLAG.GENERAL)
}
