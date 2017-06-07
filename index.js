
const Bot = require('./src/bot.js')
const fs = require('fs')
const getConfig = function (path) {
  let config = null
  let savePath = path || './cache'
  if (fs.existsSync('./config.json')) {
    config = JSON.parse(fs.readFileSync('./config.json'))
  } else if (fs.existsSync(`${savePath}/config.json`)) {
    config = JSON.parse(fs.readFileSync(`${savePath}/config.json`))
  }
  return config
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
