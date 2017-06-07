const Command = require('../src/command.js')
const botconsole = require('../src/botconsole.js')
const fs = require('fs')

module.exports = {
  'set-avatar': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      if (fs.existsSync(args[0]) && !fs.statSync(args[0]).isDirectory()) {
        self.client.user.setAvatar(args[0]).then(function (user) {
          botconsole.out('Avatar set!')
          self.rl.prompt()
        }).catch(function (err) {
          botconsole.error(err)
          self.rl.prompt()
        })
        return `Setting avatar to ${args[0]}`
      } else {
        return 'File not found!'
      }
    },
    'Set this bot\'s avatar.\nArguments:\n`file`: A path or URL to a file to set the bot\'s avatar too.',
    Command.FLAG.CONSOLE
  ),
  'reset-avatar': new Command(
    function (message, self) {
      self.client.user.setAvatar(self.client.user.defaultAvatarURL).then(function (user) {
        botconsole.out('Avatar set!')
        self.rl.prompt()
      }).catch(function (err) {
        botconsole.error(err)
        self.rl.prompt()
      })
      return 'Resetting Avatar!'
    },
    'Reset this bot\'s avatar to the default avatar.',
    Command.FLAG.CONSOLE
  )
}
