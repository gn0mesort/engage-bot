
const Bot = require('./src/bot.js')
const fs = require('fs')
const engageBot = fs.existsSync('./config.json') ? new Bot(JSON.parse(fs.readFileSync('./config.json', 'utf8'))) : new Bot()

engageBot.login()
