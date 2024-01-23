const DHT = require('hyperdht')

class DHTService {
  make (opts = {}) {
    return new DHT(opts)
  }
}

module.exports = { DHTService }
