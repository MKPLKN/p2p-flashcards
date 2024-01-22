const { getMasterComponents } = require('p2p-resources')

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getMasterDatabase () {
  const { masterDb } = getMasterComponents()
  return masterDb
}

module.exports = {
  wait,
  getMasterDatabase
}
