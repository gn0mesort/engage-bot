const validate = function (value) {
  let r = value
  if (!Number.isFinite(value) && value > 0) {
    r = Number.MAX_SAFE_INTEGER
  } else if (!Number.isFinite(value) && value < 0) {
    r = Number.MIN_SAFE_INTEGER
  } else if (!Number.isFinite(value)) {
    r = 0
  }
  return r
}


class UserScore {
  constructor (tag, score, inventory) {
    this._score = 0
    this.tag = tag
    this.score = score || 0
    this.inventory = inventory || {}
  }

  get score () {
    return this._score
  }

  set score (value) {
    this._score = validate(value)
  }

  toJSON () {
    return {
      tag: this.tag,
      score: this.score,
      inventory: this.inventory
    }
  }
}

module.exports = UserScore
