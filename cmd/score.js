const Command = require('../src/command.js')
const UserScore = require('../src/userscore.js')

module.exports = {
  'score': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      let id = args.length > 0 ? args[0].trim().replace(/<@!?([^&]+)>/g, '$1') : ''
      if (id in self.scores) {
        return `${self.scores[id].tag} has ${self.scores[id].score} ${self.config.unit}`
      } else if (id) {
        return `That user wasn't found or doesn't have a score yet!`
      } else if (message.author === 'CONSOLE') {
        return 'The console doesn\'t have a score.'
      } else {
        let output = message.author.id in self.scores ? self.scores[message.author.id].score : 0
        return `You currently have ${output} ${self.config.unit}`
      }
    },
    'Display your current score or the score of a user you mention.\nArguments:\n`user`: The user whose score you want to see. If this is omitted your score will be displayed.',
    Command.FLAG.GENERAL
  ),
  'add': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      if (args.length >= 2) {
        let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1')
        let value = Number(args[1].trim())
        if (!id.match(/\D/g)) {
          if (id in self.scores) {
            self.scores[id].score += value
          } else {
            self.scores[id] = new UserScore(self.client.users.get(id).tag, value)
          }
          return `added ${value} ${self.config.unit} to ${self.scores[id].tag}`
        }
      }
      return `Can't add ${self.config.unit} to that user!`
    },
    'Add score to a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to add.',
    Command.FLAG.ADMIN
  ),
  'subtract': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      if (args.length >= 2) {
        let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1')
        let value = Number(args[1].trim())
        if (!id.match(/\D/g)) {
          if (id in self.scores) {
            self.scores[id].score -= value
          } else {
            self.scores[id] = new UserScore(self.client.users.get(id).tag, -value)
          }
          return `subtracted ${value} ${self.config.unit} from ${self.scores[id].tag}`
        }
      }
      return `Can't subtract ${self.config.unit} from that user!`
    },
    'Subtract score from a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to subtract.',
    Command.FLAG.ADMIN
  ),
  'set': new Command(
    function (message, self) {
      let args = message.content.split(' ')
      if (args.length >= 2) {
        let id = args[0].trim().replace(/<@!?([^&]+)>/g, '$1')
        let value = Number(args[1].trim())
        if (!id.match(/\D/g)) {
          if (id in self.scores) {
            self.scores[id].score = value
          } else {
            self.scores[id] = new UserScore(self.client.users.get(id).tag, value)
          }
          return `set ${self.scores[id].tag}'s ${self.config.unit} to ${value}`
        }
      }
      return `Can't set ${self.config.unit} for that user!`
    },
    'Set a user\'s total.\nArguments:\n`user`: The @ name of the user to alter.\n`score`: The value to set.',
    Command.FLAG.ADMIN
  ),
  'top': new Command(
    function (message, self) {
      let scoreBoard = []
      let output = '\nTOP USERS:\n'
      for (let user in self.scores) {
        scoreBoard.push(self.scores[user])
      }
      scoreBoard.sort(function (a, b) {
        if (a.score > b.score) {
          return -1
        } else if (a.score < b.score) {
          return 1
        } else {
          return 0
        }
      })
      for (let i = 0; i < (scoreBoard.length <= 10 ? scoreBoard.length : 10); ++i) {
        output += `${i + 1}. ${scoreBoard[i].tag} : ${scoreBoard[i].score} ${self.config.unit}\n`
      }
      return output || 'No scores yet!'
    },
    'Display the top 10 users of this server.',
    Command.FLAG.GENERAL
  )
}
