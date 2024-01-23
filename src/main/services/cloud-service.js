const b4a = require('b4a')
const { app } = require('../helpers')

class CloudService {
  constructor () {
    this.username = null
    this.publicKey = null
    this.dht = null
    this.connected = null
    this.socket = null
  }

  _dhtOnError (err) {
    console.log(err)
  }

  _dhtOnClose () {
    console.log('DHT connection closed!')
    this.connected = false
    app('eventService').emit('cloud:disconnected', {
      username: this.username,
      publicKey: this.publicKey,
      connected: this.connected
    })
  }

  _socketOnClose () {
    console.log('Cloud service socket on close.')
  }

  _socketOnError (error) {
    console.log('Cloud service socket on error', error)
  }

  async _dhtOnConnection () {
    this.connected = true
    app('eventService').emit('cloud:connected', {
      socket: this.socket,
      username: this.username,
      publicKey: this.publicKey,
      connected: this.connected
    })
  }

  connect (opts = {}) {
    const { username, keyPair, connectTo } = opts
    this.username = username
    this.publicKey = keyPair && keyPair.publicKey ? keyPair.publicKey.toString('hex') : null

    const pubkeyBuffer = typeof connectTo === 'string' ? b4a.from(connectTo, 'hex') : connectTo
    const dht = app('DHT')
    this.dht = dht.make({ keyPair })
    this.socket = this.dht.connect(pubkeyBuffer)
    this.socket.on('close', this._dhtOnClose.bind(this))
    this.socket.on('error', this._dhtOnError.bind(this))
    this.socket.on('connect', this._dhtOnConnection.bind(this))

    return this.socket
  }

  async disconnect () {
    if (!this.socket) return
    await this.socket.destroy({ force: true })
  }
}

module.exports = { CloudService }
