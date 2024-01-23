const { FakeSocket } = require('./dht-service.test')

class FakeDiscovery {
  async flushed () {
    //
  }
}

class TestSwarmService extends FakeSocket {
  constructor (opts = {}) {
    super()
    this.opts = opts
  }

  make (opts = {}) {
    return new TestSwarmService(opts)
  }

  join (topic) {
    return new FakeDiscovery()
  }
}

module.exports = { TestSwarmService }
