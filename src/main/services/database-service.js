const b4a = require('b4a')
const goodbye = require('graceful-goodbye')
const { Flashcard } = require('../models/flashcard')
const { app } = require('../helpers')

class DatabaseService {
  constructor (db) {
    this.db = db
    this.swarm = null
    this.socket = null
    this.replicated = false

    app('events').on('cloud:connected', this._conntectedToCloud.bind(this))
  }

  get topic () {
    return typeof this.discoveryKey === 'string' ? b4a.from(this.discoveryKey, 'hex') : this.discoveryKey
  }

  get discoveryKey () {
    return this.db.discoveryKey
  }

  get key () {
    return this.db.key.toString('hex')
  }

  model (name) {
    switch (name) {
      case 'flashcard':
        return new Flashcard({ masterDb: this.db })

      default:
        break
    }
  }

  async disconnect () {
    if (!this.swarm) return
    await this.swarm.destroy({ force: true })
  }

  async _conntectedToCloud ({ socket: dhtSocket, username, publicKey }) {
    if (this.replicated) return

    // @TODO: Maybe we should check do we have a backup key in here?

    this.swarm = app('swarm').make()
    goodbye(() => this.swarm.destroy(), 1)
    this.swarm.on('connection', this._replicate.bind(this))
    console.log('Connect...')
    const discovery = this.swarm.join(this.topic)
    await discovery.flushed()
    console.log(`Joined to ${this.topic}`)

    const payload = {
      event: 'replicate',
      user: username,
      pubkey: publicKey,
      resources: [{ key: this.key }]
    }
    dhtSocket.write(JSON.stringify(payload))
  }

  async _replicate (socket) {
    app('events').emit('db:socket:open')
    this.socket = socket
    const remotePubkey = this.socket.remotePublicKey.toString('hex')

    this.socket.on('close', this._socketOnClose.bind(this))
    this.socket.on('error', this._socketOnError.bind(this))

    console.log(`New connection to replicate "${this.key}" from "${remotePubkey}"`)

    this.db.replicate(socket)
    this.replicated = true
    app('events').emit('db:replicated', { socket })
    this.db.core.once('append', () => {
      app('events').emit('db:replicated:append', { socket })
    })
  }

  _socketOnError (error) {
    console.log(error)
  }

  _socketOnClose () {
    console.log('Swarm connection closed!')
    this.replicated = false
    app('events').emit('db:socket:closed')
  }
}

module.exports = { DatabaseService }
