const Command = require('../src/command.js')

module.exports = {
  'ping': new Command(
    function (message, self) {
      return `${self.client.ping.toFixed(2)}ms`
    },
    'Get the ping from this bot to Discord\'s servers in milliseconds.',
    Command.FLAG.GENERAL
  )
}
