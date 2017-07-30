/**
 * bid.js
 * Define commands related to the bidding system
 */

// Requires
const Command = require('../src/command.js') // Command objects
const UserScore = require('../src/userscore.js') // UserScore objects

/**
 * Clear all bids
 * @param {Bot} self The bot to clear bids for
 */
const clearBids = function (self) {
  for (let user in self.scores) { // For every user in the scores table
    if ('bid' in self.scores[user].inventory) { // If they have a bid
      delete self.scores[user].inventory['bid'] // Clear the bid
    }
  }
}

/**
 * Return the top bid for the current bot
 * @param {Bot} self The bot to search
 * @return {Object} The top bid in the input Bot's scores table
 */
const topBid = function (self) {
  let bids = [] // Set bids to a new array
  for (let user in self.scores) { // For every user in the current scores table
    if ('bid' in self.scores[user].inventory) { // If the user has a bid
      bids.push(self.scores[user]) // push the bid into the bids array
    }
  }
  bids.sort(function (a, b) { // Sort the bids
    if (a.inventory.bid.value > b.inventory.bid.value) { // If the last bid's value is greater than the current bid's value
      return -1
    } else if (a.inventory.bid.value < b.inventory.bid.value) { // If the last bid's value is less than the current bid's value
      return 1
    } else if (a.inventory.bid.time < b.inventory.bid.time) { // If the last bid was made before the next bid
      return -1
    } else if (a.inventory.bid.time > b.inventory.bid.time) { // If the last bid was made after the next bid
      return 1
    } else { // Otherwise
      return 0
    }
  })
  return bids[0] // Return the top bid
}

module.exports = {
  /**
   * Start bidding for this bot
   */
  'open-bidding': new Command(
    function (message, self) {
      if (self.data.biddingOpen) { // If bidding is already open
        return 'Bidding is already open!'
      } else { // Otherwise
        self.data.biddingOpen = true // Open bidding
        return 'Bidding has begun!'
      }
    },
    'Allow users to bid on data values.',
    Command.FLAG.ADMIN
  ),
  /**
   * Close bidding for this bot
   */
  'close-bidding': new Command(
    function (message, self) {
      if (self.data.biddingOpen) { // If bidding is open
        let topBidder = topBid(self) // Get the top bid
        if (topBidder) { // If there was a top bidder
          let value = topBidder.inventory.bid.value // Get the value of the top bid
          let data = topBidder.inventory.bid.data // Get the data stored in the top bid
          clearBids(self) // Clear all bids
          topBidder.score -= value // Subtract the value of the bid from the top bidder
          self.data.biddingOpen = false // Close bidding
          return `${topBidder.tag} won with ${value} ${self.config.unit} on "${data}"!` // Return the top bidder
        } else { // Otherwise
          self.data.biddingOpen = false // Close bidding
          return `No bids were placed! Bidding closed!`
        }
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Close bidding. Clear all users bids and deduct the winner\'s points',
    Command.FLAG.ADMIN
  ),
  'close-bidding-in': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arguments
      let time = Number(args[0]) // Calculate time from arguments
      if (self.data.biddingOpen && time > 0 && Number.isFinite(time)) { // If bidding is open and the timeout is valid
        let interval = self.client.setInterval(() => { // Store interval so we can clear it
          if (time % 5 === 0 && time > 0) { // If the time remaining is divisible by 5 and greater than 0
            message.channel.send(`${time} seconds remaining until bidding closes!`) // Output the time
            --time // Reduce by 1 second
          } else if (time > 0) { // Otherwise if the time is greater than 0
            --time // Reduce time by 1 second
          } else { // Otherwise
            let topBidder = topBid(self) // Get the top bid
            if (topBidder) { // If there was a top bidder
              let value = topBidder.inventory.bid.value // Get the value of the top bid
              let data = topBidder.inventory.bid.data // Get the data stored in the top bid
              clearBids(self) // Clear all bids
              topBidder.score -= value // Subtract the value of the bid from the top bidder
              self.data.biddingOpen = false // Close bidding
              self.client.clearInterval(interval) // Clear interval
              message.channel.send(`${topBidder.tag} won with ${value} ${self.config.unit} on "${data}"!`) // Return the top bidder
            } else { // Otherwise
              self.data.biddingOpen = false // Close bidding
              self.client.clearInterval(interval) // Clear interval
              message.channel.send(`No bids were placed! Bidding closed!`) // Return no bids
            }
          }
        }, 1000)
        return `Closing bidding in ${time} seconds!` // Return the time remaining
      } else if (time <= 0 || !Number.isFinite(time)) { // If the timeout was unacceptable
        return 'Timeout must be greater than 0 seconds and a valid number!'
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Close bidding in the specified number of seconds.\nArguments:\n`time`: The amount of time in seconds to wait before closing bidding.',
    Command.FLAG.ADMIN
  ),
  /**
   * Close bidding and clear all bids without subtracting any points
   */
  'clear-close-bidding': new Command(
    function (message, self) {
      if (self.data.biddingOpen) { // If bidding is open
        clearBids(self) // Clear all bids
        self.data.biddingOpen = false // Close bidding
        return 'All bids have been cleared and bidding is now closed!'
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Clear all user bids and close bidding without deductiong points',
    Command.FLAG.ADMIN
  ),
  /**
   * Clear all bids
   */
  'clear-bidding': new Command(
    function (message, self) {
      if (self.data.biddingOpen) { // If bidding is open
        clearBids(self) // Clear bids
        return 'All bids have been cleared!'
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Clear all user bids without deducting points.',
    Command.FLAG.ADMIN
  ),
  /**
   * Get the top bidder
   */
  'top-bid': new Command(
    function (message, self) {
      if (self.data.biddingOpen) { // If bidding is open
        let topBidder = topBid(self) // Get the top bidder
        if (topBidder) {
          return `The top bidder is ${topBidder.tag} with ${topBidder.inventory.bid.value} ${self.config.unit} on "${topBidder.inventory.bid.data}"!` // Return the top bidder, their bid value, and data
        } else {
          return 'No bids have been placed!'
        }
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Get the current top bid.',
    Command.FLAG.GENERAL
  ),
  /**
   * Create a new bid or check your current bid
   */
  'bid': new Command(
    function (message, self) {
      if (message.author !== 'CONSOLE' && self.data.biddingOpen) { // If the message is not from the console and bidding is open
        let args = message.content.split(' ') // Split arguments
        if (args.length >= 2 && self.scores[message.author.id]) { // If there are at least 2 arguments and the author has a score
          let inValue = UserScore.validate(Number(args[0])) // Set the input value to the parsed value of the first argument
          let inData = args.slice(1).join(' ') // Set the data to the remaining arguments joined
          if (self.scores[message.author.id].score && inValue <= self.scores[message.author.id].score && inValue > 0) { // If the bid is within the range of the author's score
            self.scores[message.author.id].inventory['bid'] = { // Create new bid in the author's inventory
              value: inValue,
              data: inData,
              time: Date.now()
            }
            return `You bid ${inValue} ${self.config.unit} on "${inData}"`
          } else { // Otherwise
            return `You can't bid more than ${self.scores[message.author.id].score} ${self.config.unit} or less than 0 ${self.config.unit}` // Return an error message
          }
        } else if (self.scores[message.author.id] && self.scores[message.author.id].score && self.scores[message.author.id].inventory['bid']) { // If the user is checking their bid instead
          return `You bid ${self.scores[message.author.id].inventory['bid'].value} ${self.config.unit} on "${self.scores[message.author.id].inventory['bid'].data}"` // Return their current bid information
        } else { // Otherwise
          return 'You have no active bids'
        }
      } else if (message.author === 'CONSOLE') { // If the message came from the console
        return 'You can\'t bid from the console!'
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Place a bid or display your current bid if you pass in no arguments.\nArguments:\n`value`: The amount of points to bid.\n`data`: The data that you want your bid to return if it wins.',
    Command.FLAG.GENERAL
  ),
  /**
   * Cancel your current bid
   */
  'cancel-bid': new Command(
    function (message, self) {
      if (self.data.biddingOpen) { // If bidding is open
        if (self.scores[message.author.id].inventory['bid']) { // If the author has a bid
          let value = self.scores[message.author.id].inventory['bid'].value // Set value to the bid value
          let data = self.scores[message.author.id].inventory['bid'].data // Set data to the bid data
          delete self.scores[message.author.id].inventory['bid'] // Clear the bid
          return `Cleared your bid of ${value} ${self.config.unit} on ${data}` // Return bid information
        } else { // Otherwise
          return `You don't have a bid to clear!`
        }
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Clear your bid if one exists.',
    Command.FLAG.GENERAL
  ),
  /**
   * Increase your bid by a given value
   */
  'increase-bid': new Command(
    function (message, self) {
      let args = message.content.split(/\s+/g) // Split arugments
      if (message.author !== 'CONSOLE' && self.data.biddingOpen && args.length > 0 && self.scores[message.author.id]) { // If the authro is not the console and bidding is open and the author has a score and arguments were passed
        let increase = UserScore.validate(Number(args[0])) // Set increase to the first argument's parsed value
        if (self.scores[message.author.id].inventory['bid']) { // If the author has a bid
          if (self.scores[message.author.id].score && self.scores[message.author.id].inventory['bid'].value + increase <= self.scores[message.author.id].score && self.scores[message.author.id].inventory['bid'].value + increase > 0) { // If the increase is within the score range
            self.scores[message.author.id].inventory['bid'].value += increase // Increase the bid
            self.scores[message.author.id].inventory['bid'].time = Date.now() // Update bid time for sorting
            return `Increased bid by ${increase} ${self.config.unit}`
          } else { // Otherwise
            return `Cannot increase bid by ${increase} ${self.config.unit}`
          }
        } else { // Otherwise
          return `You must place a bid before increasing it`
        }
      } else if (message.author === 'CONSOLE') { // If the author was the console
        return 'You can\'t bid from the console!'
      } else if (args.length <= 0) { // If there weren't enough arguments
        return 'Invalid Input!'
      } else if (!self.scores[message.author.id]) { // If the author didn't have a score
        return 'You must have a score and a bid before increasing!'
      } else { // Otherwise
        return 'Bidding is not open yet!'
      }
    },
    'Increase your current bid.\nArguments:\n`value`: The amount of points to inscrease your bid by.',
    Command.FLAG.GENERAL
  )
}
