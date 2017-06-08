/**
 * index.js
 * The main file for engage-bot. This file instantiates a new bot, loads data for the bot, and logs the bot in
 */

// Requires
const Bot = require('./src/bot.js') // Bot object
const Config = require('./src/config.js') // Config object
const fs = require('fs') // Node filesystem library

// Functions

/**
 * Build a configuration object out of files located in cache/ and ./
 * @param {String} path The path to search for configuration files. Defaults to './cache'
 * @return {Config} The final configuration object
 */
const getConfig = function (path) {
  let config = new Config() // Set config to a new default Configuration
  let override = null // Set the override value to null
  let savePath = path || './cache' // Set savePath to the value of path or './cache'
  if (fs.existsSync('./config.json')) { // Check if a root level configuration file exists
    override = JSON.parse(fs.readFileSync('./config.json')) // Load the object and parse it
  }
  if (fs.existsSync(`${savePath}/config.json`)) { // Check if a cached config exists
    config = JSON.parse(fs.readFileSync(`${savePath}/config.json`)) // Load the cached configuration
  }
  return Object.assign(config, override) // Merge config and override and return
}

/**
 * Load the score object from the cache
 * @param {String} path The path to search for configuration files. Defaults to './cache'
 * @return {Object} an object containing the unparsed score data
 */
const getScores = function (path) {
  let scores = null // Set scores to null
  let savePath = path || './cache' // Set savePath to the value of path or './cache'
  if (fs.existsSync(`${savePath}/scores.json`)) { // If the main scores file exists
    scores = JSON.parse(fs.readFileSync(`${savePath}/scores.json`)) // Load the scores
  } else if (fs.existsSync(`${savePath}/scores.bak.json`)) { // Otherwise if the backup exists
    scores = JSON.parse(fs.readFileSync(`${savePath}/scores.bak.json`)) // Load the scores
  }
  return scores // Return the scores
}

// Main Script

let engageBot = new Bot(getConfig(), getScores()) // Instantiate a new bot with the correct scores and configuration
engageBot.login() // Login in to Discord
