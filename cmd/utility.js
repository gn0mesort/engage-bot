const Command = require('../src/command.js')

module.exports = {
  'role-ids': new Command(
    function (message, self) {
      let output = ''
      for (let guild of self.client.guilds.array()) {
        output += `${guild.name}:\n`
        for (let role of guild.roles.array()) {
          output += `  ${role.name} : ${role.id}\n`
        }
      }
      return message.author === 'CONSOLE' ? output : `\`\`\`\n${output}\n\`\`\``
    },
    'Display all role ids for all the servers this bot belongs to',
    Command.FLAG.GENERAL
  ),
  'user-count': new Command(
    function (message, self) {
      let channel = message.author !== 'CONSOLE' ? message.author.lastMessage.channel : message.author
      if (channel.type === 'text') {
        return `${channel.guild.members.size} users`
      } else if (channel.type === 'dm') {
        return `2 users`
      } else if (channel.type === 'group') {
        return `${channel.recipients.size} users`
      } else {
        return '0 users'
      }
    },
    'Respond with the server\'s current user count.',
    Command.FLAG.GENERAL
  ),
  'echo': new Command(
    function (message, self) {
      return message.content
    },
    'Echo the input message.',
    Command.FLAG.GENERAL
  )
}
