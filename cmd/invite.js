const Command = require('../src/command.js')
const botconsole = require('../src/botconsole.js')

module.exports = {
  'invite': new Command(
    function (message, self) {
      try {
        let permissions = message.content.split(' ').filter(function (perm) { return perm !== '' && perm !== ' ' })
        if (permissions.length === 0) {
          permissions = require('discord.js').Permissions.DEFAULT
        }
        self.client.generateInvite(permissions).then((link) => {
          botconsole.out(link)
          self.rl.prompt()
        }, (err) => {
          botconsole.out(err)
          self.rl.prompt()
        })
        return ''
      } catch (err) {
        return err
      }
    },
    'Fetch a bot invite link with the given permissions.\nArguments:\n`permissions`: The permissions this bot should request as the names of Discord.js Permissions.',
    Command.FLAG.CONSOLE
  ),
  'leave': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      for (let guild of self.client.guilds.array()) {
        if (args[0] === guild.name || args[0] === guild.id) {
          guild.leave()
        }
      }
    },
    'Leave the given server.\nArguments:\n`server`: A server name or id to leave.'
  )
}
