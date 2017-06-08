const Command = require('../src/command.js')

const clearBids = function (self) {
  for (let user in self.scores) {
    if ('bid' in self.scores[user].inventory) {
      self.scores[user].inventory['bid'] = undefined
    }
  }
}

const topBid = function (self) {
  let bids = []
  for (let user in self.scores) {
    if ('bid' in self.scores[user].inventory) { bids.push(self.scores[user]) }
  }
  bids.sort(function (a, b) {
    if (a.inventory.bid.value > b.inventory.bid.value) {
      return -1
    } else if (a.inventory.bid.value < b.inventory.bid.value) {
      return 1
    } else {
      return 0
    }
  })
  return bids[0]
}

module.exports = {
  'open-bidding': new Command(
    function (message, self) {
      if (self.config.biddingOpen) {
        return 'Bidding is already open!'
      } else {
        self.config.biddingOpen = true
        return 'Bidding has begun!'
      }
    },
    'Allow users to bid on data values.',
    Command.FLAG.ADMIN
  ),
  'close-bidding': new Command(
    function (message, self) {
      if (self.config.biddingOpen) {
        let topBidder = topBid(self)
        let value = topBidder.inventory.bid.value
        let data = topBidder.inventory.bid.data
        clearBids(self)
        topBidder.score -= value
        self.config.biddingOpen = false
        return `${topBidder.tag} won with ${value} ${self.config.unit} on "${data}"!`
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Close bidding. Clear all users bids and deduct the winner\'s points',
    Command.FLAG.ADMIN
  ),
  'clear-close-bidding': new Command(
    function (message, self) {
      if (self.config.biddingOpen) {
        clearBids(self)
        self.config.biddingOpen = false
        return 'All bids have been cleared and bidding is now closed!'
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Clear all user bids and close bidding without deductiong points',
    Command.FLAG.ADMIN
  ),
  'clear-bidding': new Command(
    function (message, self) {
      if (self.config.biddingOpen) {
        clearBids(self)
        return 'All bids have been cleared!'
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Clear all user bids without deducting points.',
    Command.FLAG.ADMIN
  ),
  'top-bid': new Command(
    function (message, self) {
      if (self.config.biddingOpen) {
        let topBidder = topBid(self)
        return `The top bidder is ${topBidder.tag} with ${topBidder.inventory.bid.value} ${self.config.unit} on "${topBidder.inventory.bid.data}"!`
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Get the current top bid.',
    Command.FLAG.GENERAL
  ),
  'bid': new Command(
    function (message, self) {
      if (message.author !== 'CONSOLE' && self.config.biddingOpen) {
        let args = message.content.split(' ')
        if (args.length >= 2 && self.scores[message.author.id]) {
          let inValue = Number(args[0])
          let inData = args.slice(1).join(' ')
          if (self.scores[message.author.id].score && inValue <= self.scores[message.author.id].score && inValue > 0) {
            self.scores[message.author.id].inventory['bid'] = {
              value: inValue,
              data: inData
            }
            return `You bid ${inValue} ${self.config.unit} on "${inData}"`
          } else {
            return `You can't bid more than ${self.scores[message.author.id].score} ${self.config.unit} or less than 0 ${self.config.unit}`
          }
        } else if (self.scores[message.author.id] && self.scores[message.author.id].score && self.scores[message.author.id].inventory['bid']) {
          return `You bid ${self.scores[message.author.id].inventory['bid'].value} ${self.config.unit} on "${self.scores[message.author.id].inventory['bid'].data}"`
        } else {
          return 'You have no active bids'
        }
      } else if (message.author === 'CONSOLE') {
        return 'You can\'t bid from the console!'
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Place a bid or display your current bid if you pass in no arguments.\nArguments:\n`value`: The amount of points to bid.\n`data`: The data that you want your bid to return if it wins.',
    Command.FLAG.GENERAL
  ),
  'cancel-bid': new Command(
    function (message, self) {
      if (self.config.biddingOpen) {
        if (self.scores[message.author.id].inventory['bid']) {
          let value = self.scores[message.author.id].inventory['bid'].value
          let data = self.scores[message.author.id].inventory['bid'].data
          self.scores[message.author.id].inventory['bid'] = undefined
          return `Cleared your bid of ${value} ${self.config.unit} on ${data}`
        } else {
          return `You don't have a bid to clear!`
        }
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Clear your bid if one exists.',
    Command.FLAG.GENERAL
  ),
  'increase-bid': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g)
      if (message.author !== 'CONSOLE' && self.config.biddingOpen && args.length > 0 && self.scores[message.author.id]) {
        let increase = Number(args[0])
        if (self.scores[message.author.id].inventory['bid']) {
          if (self.scores[message.author.id].score && self.scores[message.author.id].inventory['bid'].value + increase <= self.scores[message.author.id].score && self.scores[message.author.id].inventory['bid'].value + increase > 0) {
            self.scores[message.author.id].inventory['bid'].value += increase
            return `Increased bid by ${increase} ${self.config.unit}`
          } else {
            return `Cannot increase bid by ${increase} ${self.config.unit}`
          }
        } else {
          return `You must place a bid before increasing it`
        }
      } else if (message.author === 'CONSOLE') {
        return 'You can\'t bid from the console!'
      } else if (args.length <= 0) {
        return 'Invalid Input!'
      } else if (!self.scores[message.author.id]) {
        return 'You must have a score and a bid before increasing!'
      } else {
        return 'Bidding is not open yet!'
      }
    },
    'Increase your current bid.\nArguments:\n`value`: The amount of points to inscrease your bid by.',
    Command.FLAG.GENERAL
  )
}
