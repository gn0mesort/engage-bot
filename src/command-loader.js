const fs = require('fs')

var commands = {}

if (fs.existsSync('./cmd')) {
  for (let path of fs.readdirSync('./cmd')) {
    Object.assign(commands, require('../cmd/' + path))
  }
}

module.exports = commands
