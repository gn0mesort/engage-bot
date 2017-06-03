const process = require('process')

var Utility = function () {
  this.console_out = function (message) {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    console.log(message)
  }
  this.console_error = function (message) {
    process.stderr.clearLine()
    process.stderr.cursorTo(0)
    console.error(message)
  }
}

module.exports = Utility
