const b4a = require('b4a')
const DHT = require('hyperdht')
const { EventService } = require('./event-service')

class CloudService {
  constructor () {
    this.username = null
    this.publicKey = null
    this.dht = null
    this.connected = null
    this.socket = null
  }

  _dhtOnError (error) {
    console.log('DHT on error', error)
  }

  _dhtOnClose () {
    console.log('DHT connection closed!')
    this.connected = false
    EventService.emit('cloud:disconnected', {
      username: this.username,
      publicKey: this.publicKey,
      connected: this.connected
    })
  }

  async _dhtOnConnection () {
    this.connected = true
    EventService.emit('cloud:connected', {
      socket: this.socket,
      username: this.username,
      publicKey: this.publicKey,
      connected: this.connected
    })
  }

  async connect (opts = {}) {
    const { username, keyPair, connectTo } = opts
    this.username = username
    this.publicKey = keyPair && keyPair.publicKey ? keyPair.publicKey.toString('hex') : null

    const pubkeyBuffer = typeof connectTo === 'string' ? b4a.from(connectTo, 'hex') : connectTo
    this.dht = new DHT({ keyPair })
    this.socket = this.dht.connect(pubkeyBuffer)
    this.socket.on('close', this._dhtOnClose.bind(this))
    this.socket.on('error', this._dhtOnError.bind(this))
    this.socket.on('connect', this._dhtOnConnection.bind(this))
  }

  async disconnect () {
    if (!this.socket) return
    await this.socket.destroy({ force: true })
  }
}

module.exports = { CloudService }
