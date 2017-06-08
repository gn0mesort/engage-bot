/**
 * userscore.js
 * Defines the UserScore object and related behavior
 */

/**
 * Validate a score value
 * @param {Number} value The value to validate
 * @return {Number} A valid value between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER. NaN values result in a 0
 */
const validate = function (value) {
  let r = value // Set r to the input value
  if (!Number.isFinite(value) && value > 0) { // If Infinity
    r = Number.MAX_SAFE_INTEGER // Set r to the max value
  } else if (!Number.isFinite(value) && value < 0) { // If -Infinity
    r = Number.MIN_SAFE_INTEGER // Set r to the min value
  } else if (!Number.isFinite(value)) { // If NaN
    r = 0 // Set r to 0
  }
  return r
}


/**
 * Defines a UserScore object that contains all data relevant to each user's scoring
 */
class UserScore {
  /**
   * Construct a new UserScore
   * @param {String} tag The user's username concatinated with a # and their discriminator
   * @param {Number} score The starting score for this user. Defaults to 0
   * @param {Object} inventory The inventory for this user. Defaults {}
   */
  constructor (tag, score, inventory) {
    this._score = 0 // Set the backing score
    this.tag = tag // Set the tag
    this.score = score || 0 // Set the score to score or 0
    this.inventory = inventory || {} // Set the inventory to inventory or {}
  }

  /**
   * Get the current score
   * @return {Number} The current score value
   */
  get score () {
    return this._score
  }

  /**
   * Set the current score to a validated score value
   * @param {Number} value The value to set. Will be validated
   */
  set score (value) {
    this._score = validate(value) // Set the score to the validated input value
  }

  /**
   * Generate JSON output correctly for this object
   * @return {Object} A JSON serializable version of this object
   */
  toJSON () {
    return {
      tag: this.tag,
      score: this.score,
      inventory: this.inventory
    }
  }
}

module.exports = UserScore
