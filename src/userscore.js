/**
 * userscore.js
 * Defines the UserScore object and related behavior
 */

/**
 * Defines a UserScore object that contains all data relevant to each user's scoring
 */
class UserScore {
  /**
   * Construct a new UserScore
   * @param {String} tag The user's username concatinated with a # and their discriminator
   * @param {Number} score The starting score for this user. Defaults to 0
   * @param {Object} inventory The inventory for this user. Defaults {}
   * @param {Number} update The time this score was last updated
   */
  constructor (tag, score, inventory, update) {
    this._score = 0 // Set the backing score
    this.tag = tag // Set the tag
    this.score = score || 0 // Set the score to score or 0
    this.inventory = inventory || {} // Set the inventory to inventory or {}
    this.update = update || Date.now()
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
    this._score = UserScore.validate(value) // Set the score to the validated input value
    this.update = Date.now() // Set last update time
  }

  /**
   * Generate JSON output correctly for this object
   * @return {Object} A JSON serializable version of this object
   */
  toJSON () {
    return {
      tag: this.tag,
      score: this.score,
      inventory: this.inventory,
      update: this.update
    }
  }

  /**
   * Validate a score value
   * @param {Number} value The value to validate
   * @return {Number} A valid value between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER. NaN values result in a 0
   */
  static validate (value) {
    let r = value // Set r to the input value
    if ((!Number.isFinite(value) && value > 0) || value > Number.MAX_SAFE_INTEGER) { // If Infinity or greater than the maximum integer
      r = Number.MAX_SAFE_INTEGER // Set r to the max value
    } else if ((!Number.isFinite(value) && value < 0) || value < Number.MIN_SAFE_INTEGER) { // If -Infinity or smaller than the minimum integer
      r = Number.MIN_SAFE_INTEGER // Set r to the min value
    } else if (!Number.isFinite(value)) { // If NaN
      r = 0 // Set r to 0
    }
    return r >= 0 ? Math.floor(r) : Math.ceil(r) // Clamp values to the nearest integer
  }
}

module.exports = UserScore
