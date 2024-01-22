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

  _dhtOnError (err) {
    console.log(err)
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

  _socketOnClose () {
    console.log('Cloud service socket on close.')
  }

  _socketOnError (error) {
    console.log('Cloud service socket on error', error)
  }

  async _dhtOnConnection () {
    this.connected = true
    this.socket.on('close', this._socketOnClose)
    this.socket.on('error', this._socketOnError)

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
    await this.socket.destroy({ force: true })
  }
}

module.exports = { CloudService }
