class FakeSocket {
  constructor () {
    this.remotePublicKey = 'fake-remote-pubkey'
    this.events = new Map()
  }

  on (eventName, fn) {
    const listeners = this.events.get(eventName) || []
    listeners.push(fn)
    this.events.set(eventName, listeners)
  }

  async emit (eventName, payload) {
    const listeners = this.events.get(eventName)
    if (listeners && listeners.length) {
      for await (const cb of listeners) {
        cb(payload)
      }
    }
  }

  write (data) {
    //
  }

  destroy () {
    //
  }
}

class TestDHTService {
  constructor (opts = {}) {
    this.opts = opts
  }

  make (opts = {}) {
    return new TestDHTService(opts)
  }

  connect (pubkey) {
    return new FakeSocket()
  }
}

module.exports = { TestDHTService, FakeSocket }
