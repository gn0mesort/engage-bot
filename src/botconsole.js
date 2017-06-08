/**
 * botconsole.js
 * Defines console output for this bot
 */

/**
 * botconsole object
 */
const botconsole = {
  /**
   * Output a message to stdout
   * @param {Object} message The message to output
   * @param {Boolean} newLine Whether or not to print a new line character
   */
  out: function (message, newLine) {
    process.stdout.clearLine() // Clear prompts
    process.stdout.cursorTo(0) // Set cursor to 0
    process.stdout.write(`${message}${!newLine ? '\n' : ''}`) // Write to stdout
  },
  /**
   * Output a message to stderr
   * @param {Object} message The message to output
   * @param {Boolean} newLine Whether or not to print a new line character
   */
  error: function (message, newLine) {
    process.stderr.clearLine() // Clear prompts
    process.stderr.cursorTo(0) // Set cursor to 0
    process.stderr.write(`${message}${!newLine ? '\n' : ''}`) // Write to stderr
  }
}

module.exports = botconsole
