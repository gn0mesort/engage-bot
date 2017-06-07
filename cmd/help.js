const Command = require('../src/command.js')
const botconsole = require('../src/botconsole.js')

module.exports = {
  'help': new Command(
    function (message, self) {
      let output = ''
      for (let command in self.commands) {
        if (self.commands[command].hasPermission(message, self)) {
          output += `\`${message.author === 'CONSOLE' ? '' : self.config.prefix}${command}\`\n${self.commands[command].help}\n\n`
        }
      }
      if (message.author === 'CONSOLE') {
        return output
      }
      message.author.createDM().then(function (channel) {
        channel.send(output).catch(function (err) {
          botconsole.out(err)
          self.rl.prompt()
        })
      })
      return 'Help is on the way!'
    },
    'Display this help message.',
    Command.FLAG.GENERAL
  ),
  'about': new Command(
    function (message, self) {
      return message.author === 'CONSOLE' ? self.config.aboutMessage : `\`\`\`\n${self.config.aboutMessage}\n\`\`\``
    },
    'Display information about this bot.',
    Command.FLAG.GENERAL
  )
}
