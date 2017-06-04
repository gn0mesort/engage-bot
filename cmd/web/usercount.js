const WebCommand = require('../../src/webcommand.js')

module.exports = {
  'user-count': new WebCommand(function (message, author, self) {
    let channel = author.lastMessage.channel
    if (channel.type === 'text') { return `${author} ${channel.guild.members.size} users` }
    else if (channel.type === 'dm') { return `${author} 2 users` }
    else if (channel.type === 'group') { return `${author} ${channel.recipients.size} users` }
  }, 'Respond with the server\'s current user count.')
}
