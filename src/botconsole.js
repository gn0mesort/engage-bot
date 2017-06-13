/**
 * botconsole.js
 * Defines console output for this bot
 */

// Requires
const readline = require('readline') // Node readline library
const tty = require('tty') // Node tty library

/**
 * Defines a BotConsole object
 */
class BotConsole {
  /**
   * Construct a new BotConsole object
   * @return {BotConsole} A newly constructed BotConsole object
   */
  constructor () {
    this.rl = readline.createInterface({ // Create readline interface
      input: process.stdin, // Set input to stdin
      output: process.stdout // Set output to stdout
    })
  }

  /**
   * Write to stdout in a way that is friendly to the bot's prompt
   * @param {String} message The message to write
   * @param {Boolean} noNewLine Whether or not to write a \n at the end of the message
   */
  out (message, noNewLine) {
    if (tty.isatty(process.stdout.fd)) { // If stdout is a tty
      readline.clearLine(process.stdout, 0) // Clear the last line
      readline.cursorTo(process.stdout, 0) // Reset the cursor
    }
    process.stdout.write(`${message}${noNewLine ? '' : '\n'}`) // Write to stdout
  }

  /**
   * Write to stderr in a way that is friendly to the bot's prompt
   * @param {String} message The message to write
   * @param {Boolean} noNewLine Whether or not to write a \n at the end of the message
   */
  error (message, noNewLine) {
    if (tty.isatty(process.stderr.fd)) { // If stderr is a tty
      readline.clearLine(process.stderr, 0) // Clear the last line
      readline.cursorTo(process.stderr, 0) // Reset the cursor
    }
    process.stderr.write(`${message}${!noNewLine ? '\n' : ''}`) // Write to stdout
  }

  /**
   * Bot friendly prompt function. Only prompt if stdout is a tty
   */
  prompt () {
    if (tty.isatty(process.stdout.fd)) { // If stdout is a tty
      this.rl.prompt() // Prompt stdin
    }
  }

  /**
   * Check if stdout is a tty
   * @return {Boolean} whether or not stdout is a tty
   */
  get isTty () {
    return tty.isatty(process.stdout.fd)
  }
}

const botconsole = new BotConsole() // The actual BotConsole to export

module.exports = botconsole
