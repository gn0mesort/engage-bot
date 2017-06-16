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
  let override = {} // Set the override value to an empty object
  let cache = {} // Set the cache value to an empty object
  let savePath = path || './cache' // Set savePath to the value of path or './cache'
  let data = {} // Set data to an empty object
  if (fs.existsSync(`${savePath}/config.json`)) { // Check if a cached config exists
    cache = JSON.parse(fs.readFileSync(`${savePath}/config.json`)) // Load the cached configuration
  }
  if (fs.existsSync('./config.json')) { // Check if a root level configuration file exists
    override = JSON.parse(fs.readFileSync('./config.json')) // Load the object and parse it
  }
  deepAssign(data, cache.data) // Merge cache data into data backup
  return new Config(deepAssign(deepAssign(cache, override, true), { data: data })) // Merge cache and override and return
}

/**
 * Assign one object's values to another recursively
 * @param {Object} objA The object to assign values to
 * @param {Object} objB The object to assign values from
 * @param {Boolean} keepUndef Whether or not to keep undefined values in objB undefined in objA
 * @return {Object} The resulting value of objA
 */
const deepAssign = function (objA, objB, keepUndef) {
  for (let prop in objB) { // For every property of objB
    if (typeof objB[prop] !== 'object' || !(prop in objA)) { // If the property is not an object or is undefined
      objA[prop] = objB[prop] // Assign objA[prop] to objB[prop]
    } else { // Otherwise
      deepAssign(objA[prop], objB[prop], keepUndef) // Do a deep assignment of objB[prop] to objA[prop]
    }
  }
  if (keepUndef) { // If we should undefine values
    for (let prop in objA) { // For every property of objA
      if (!(prop in objB)) { // If the same property is not in objB
        delete objA[prop] // Delete the property
      }
    }
  }
  return objA
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
engageBot.login() // Login to Discord
