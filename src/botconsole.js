module.exports.out = function (message, newLine) {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(`${message}${!newLine ? '\n' : ''}`)
}

module.exports.error = function (message, newLine) {
  process.stderr.clearLine()
  process.stderr.cursorTo(0)
  process.stderr.write(`${message}${!newLine ? '\n' : ''}`)
}
