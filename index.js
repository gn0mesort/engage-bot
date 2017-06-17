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
  let override = null // Set the override value to null
  let cache = null // Set the cache value to null
  let savePath = path || './cache' // Set savePath to the value of path or './cache'
  if (fs.existsSync(`${savePath}/config.json`)) { // Check if a cached config exists
    cache = JSON.parse(fs.readFileSync(`${savePath}/config.json`)) // Load the cached configuration
  }
  if (fs.existsSync('./config.json')) { // Check if a root level configuration file exists
    override = JSON.parse(fs.readFileSync('./config.json')) // Load the object and parse it
  }
  return new Config(override || cache) // If the root config exists use it otherwise attempt to use the cached config
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

/**
 * Load a data object from the cache
 * @param {String} path The path to search for data files. Defaults to './cache'
 * @return {Object} The parsed data object or null if the data file wasn't found
 */
const getData = function (path) {
  let savePath = path || './cache' // Set savePath to the value of path or './cache'
  if (fs.existsSync(`${savePath}/data.json`)) { // If the data file exists
    return JSON.parse(fs.readFileSync(`${savePath}/data.json`)) // Parse and return it
  }
  return null // Otherwise return nothing
}

// Main Script

let engageBot = new Bot(getConfig(), getScores(), getData()) // Instantiate a new bot with the correct scores, configuration, and data
engageBot.login() // Login to Discord
