var WebCommand = function (action, help, admin) {
  this.action = action
  this.help = help || ''
  this.admin = admin || false
}

module.exports = WebCommand
