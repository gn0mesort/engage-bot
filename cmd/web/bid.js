const WebCommand = require('../../src/webcommand.js')

module.exports = {
  'bid': new WebCommand(function (message, author, self) {
    let args = message.split(' ')
    if (args.length >= 2 && self.scores[author.id]) {
      let inValue = self.validateScore(Number(args[0]))
      let inData = args.slice(1).join(' ')
      if (self.scores[author.id].score && inValue <= self.scores[author.id].score && inValue > 0) {
        self.scores[author.id]['bid'] = {
          value: inValue,
          data: inData
        }
        return `${author} You bid ${inValue} ${self.config.scoreUnit} on ${inData}`
      } else { return `${author} You can't bid more than ${self.scores[author.id].score} ${self.config.scoreUnit} or less than 0 ${self.config.scoreUnit}` }
    } else if (self.scores[author.id] && self.scores[author.id].score && self.scores[author.id]['bid']) { return `${author} You bid ${self.scores[author.id]['bid'].value} ${self.config.scoreUnit} on ${self.scores[author.id]['bid'].data}` }
    else { return `${author} You have no active bids` }
  }, 'Place a bid or display your current bid if you pass in no arguments.\nArguments:\n`value`: The amount of points to bid.\n`data`: The data that you want your bid to return if it wins.'),
  'increase-bid': new WebCommand(function (message, author, self) {
    let args = message.split(' ')
    if (args.length > 0 && self.scores[author.id]) {
      let increase = self.validateScore(Number(args[0]))
      if (self.scores[author.id]['bid']) {
        if (self.scores[author.id].score && self.scores[author.id]['bid'].value + increase <= self.scores[author.id].score && self.scores[author.id]['bid'].value + increase > 0) {
          self.scores[author.id]['bid'].value += increase
          return `${author} Increased bid by ${increase} ${self.config.scoreUnit}`
        } else { return `${author} Cannot increase bid by ${increase} ${self.config.scoreUnit}` }
      } else { return `${author} You must place a bid before increasing it` }
    }
  }, 'Increase your current bid.\nArguments:\n`value`: The amount of points to inscrease your bid by.'),
  'cancel-bid': new WebCommand(function (message, author, self) {
    if (self.scores[author.id]['bid']) {
      let value = self.scores[author.id]['bid'].value
      let data = self.scores[author.id]['bid'].data
      self.scores[author.id]['bid'] = undefined
      return `${author} Cleared your bid of ${value} ${self.config.scoreUnit} on ${data}`
    } else { return `${author} You don't have a bid to clear!` }
  }, 'Clear your bid if one exists.'),
  'close-bidding': new WebCommand(function (message, author, self) {
    let bids = []
    for (let user in self.scores) {
      if ('bid' in self.scores[user]) { bids.push(self.scores[user]) }
    }
    bids.sort(function (a, b) {
      if (a.bid.value > b.bid.value) { return -1 }
      else if (a.bid.value < b.bid.value) { return 1 }
      else { return 0 }
    })
    if (bids.length > 0) {
      let output = `${author} ${bids[0].tag} won with ${bids[0].bid.value} ${self.config.scoreUnit} on ${bids[0].bid.data}!`
      bids[0].score -= bids[0].bid.value
      for (let user in self.scores) {
        self.scores[user]['bid'] = undefined
      }
      return output
    } else { return `${author} No bids have been placed` }
  }, 'Close bidding and return the highest bidder.', true)
}
