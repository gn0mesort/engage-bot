/**
 * log.js
 * Defines a command for logging properties of the current bot
 */

// Requires
const Command = require('../src/command.js') // Command objects
const safeJSONStringify = require('safe-json-stringify') // safeJSONStringify functions

module.exports = {
  /**
   * Log a property of the current bot to the console or to the server of the sender
   */
  'log': new Command(function (message, self) {
    let objs = message.content.trim().split('.') // Split input into objects
    let root = self[objs[0]] // Set root to the first object
    let props = objs.slice(1) // Set props to the remaining objects
    let output = '' // Set output to an empty string
    for (let prop of props) { // For every property in props
      if (root && prop in root) { // If the root exists and prop is in root
        root = root[prop] // Set root to root[prop]
      } else { // Otherwise
        root = undefined // Set root to undefined
      }
    }
    output = JSON.stringify(safeJSONStringify.ensureProperties(root), null, ' ') || 'undefined' // Set the output to a safe stringification of the current object or undefined
    return message.author === 'CONSOLE' ? output : `\n\`\`\`json\n${output}\n\`\`\`` // If sending to a server log in block text
  },
  'Log a property of this bot.\nArguments:\n`object`: The object to log in the format x.y.z etc.',
  Command.FLAG.ADMIN
  )
}
