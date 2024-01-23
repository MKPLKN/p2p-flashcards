const Hyperswarm = require('hyperswarm')

class SwarmService {
  make (opts = {}) {
    return new Hyperswarm(opts)
  }
}

module.exports = { SwarmService }
