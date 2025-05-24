import Trade from "./trade"

const models = {
  Trade,
}

// bind the associations
associate(models)

/**
 * expose
 */

export { Trade }

/**
 * associate runs the associations method on any applicable model
 *
 * @param {Array} models (Array of models)
 * @api private
 */

function associate(models: any) {
  let keys = Object.keys(models)

  let i = 0
  let j = keys.length
  for (; i < j; i++) {
    let k = keys[i]
    let m = models[k]

    if (!Object.prototype.hasOwnProperty.call(m, "associate")) {
      continue
    }

    m.associate(models)
  }
}
