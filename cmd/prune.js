/**
 * prune.js
 * A module that defines commands related to pruning the score table
 */

// Requires
const Command = require('../src/command.js') // Command objects

module.exports = {
  /**
   * A command that prunes data from the scores table
   */
  'prune': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      if (args.length > 0 && args[0] !== '') { // If at least the first argument exists
        if (args[0] in self.scores) { // If the argument is in the score table
          self.prune(args[0]) // Prune it
          return `${args[0]} pruned!`
        } else { // Otherwise
          return 'ID not found!'
        }
      } else { // Otherwise
        self.pruneTable() // Prune the whole table
        return 'Table pruned!'
      }
    },
    'Prune a user by their id or if no arguments are given prune the whole table.\nArguments:\n`user`: A specific user id to remove from the table.',
    Command.FLAG.CONSOLE
  )
}
