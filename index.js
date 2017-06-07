
const Bot = require('./src/bot.js')
const Config = require('./src/config.js')
const fs = require('fs')
const getConfig = function (path) {
  let config = new Config()
  let override = null
  let savePath = path || './cache'
  if (fs.existsSync('./config.json')) {
    override = JSON.parse(fs.readFileSync('./config.json'))
  } else if (fs.existsSync(`${savePath}/config.json`)) {
    config = JSON.parse(fs.readFileSync(`${savePath}/config.json`))
  }

  return Object.assign(config, override)
}
const getScores = function (path) {
  let scores = null
  let savePath = path || './cache'
  if (fs.existsSync(`${savePath}/scores.json`)) {
    scores = JSON.parse(fs.readFileSync(`${savePath}/scores.json`))
  } else if (fs.existsSync(`${savePath}/scores.bak.json`)) {
    scores = JSON.parse(fs.readFileSync(`${savePath}/scores.bak.json`))
  }
  return scores
}

let engageBot = new Bot(getConfig(), getScores())
engageBot.login()
