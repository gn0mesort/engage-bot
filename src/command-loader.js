// Requires
const fs = require('fs') // Node filesystem library

const commands = {} // Create commands object

if (fs.existsSync('./cmd')) { // If the ./cmd directory exists
  for (let path of fs.readdirSync('./cmd')) { // For every file in ./cmd
    Object.assign(commands, require('../cmd/' + path)) // Merge command modules into commands
  }
}

module.exports = commands
