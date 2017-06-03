const WebCommand = require('../../src/webcommand.js')

module.exports = {
  ding: new WebCommand(function (message, author, self) {
    return `${author} dong`
  }, 'Respond with "dong".')
}
