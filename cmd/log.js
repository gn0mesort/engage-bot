const Command = require('../src/command.js')
const safeJSONStringify = require('safe-json-stringify')

module.exports = {
  'log': new Command(function (message, self) {
    let objs = message.content.trim().split('.')
    let root = self[objs[0]]
    let props = objs.slice(1)
    let output = ''
    for (let prop of props) {
      if (root && prop in root) {
        root = root[prop]
      } else {
        root = undefined
      }
    }
    output = JSON.stringify(safeJSONStringify.ensureProperties(root), null, ' ') || 'undefined'
    if (output.length > 1900) {
      output = 'OUTPUT TOO LONG'
    }
    return message.author === 'CONSOLE' ? output : `\n\`\`\`json\n${output}\n\`\`\``
  },
  'Log a property of this bot.\nArguments:\n`object`: The object to log in the format x.y.z etc.',
  Command.FLAG.ADMIN
  )
}
