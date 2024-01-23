const { authUser, createUser, restoreUser } = require('p2p-auth')
const { initMasterComponents } = require('p2p-resources')
const { EventService } = require('./event-service')
const { DatabaseService } = require('./database-service')

class UserService {
  constructor (cloudService) {
    this.username = null
    this.keyPair = null
    this.settings = null
    this.databaseService = null
    this.cloudService = cloudService

    EventService.on('authenticated:success', this._authenticated.bind(this))
  }

  async create ({ username, password }) {
    try {
      const { mnemonic } = await createUser({ username, password })
      await this.authenticate({ username, password })
      return { mnemonic }
    } catch (error) {
      throw new Error('User creation failed')
    }
  }

  async restore ({ seedPhrase, username, password }) {
    try {
      await restoreUser({ seedPhrase, username, password })
      await this.authenticate({ username, password })
    } catch (error) {
      throw new Error('User restore failed')
    }
  }

  async authenticate ({ username, password }) {
    try {
      const { username: name, keyPair } = await authUser({ username, password })
      const { masterDb } = await initMasterComponents()

      this.username = name
      this.keyPair = keyPair
      this.databaseService = new DatabaseService(masterDb)
      this.settings = null
      await this.loadSettings()

      EventService.emit('authenticated:success', { user: this })
    } catch (error) {
      throw new Error('Authentication failed!')
    }
  }

  async _authenticated () {
    const pubkey = await this.getSettings('backup_pub_key')
    if (!pubkey) return
    this.connect(pubkey)
  }

  async connect (pubkey) {
    if (!this.cloudService) return

    this.cloudService.connect({
      username: this.username,
      keyPair: this.keyPair,
      connectTo: pubkey
    })
  }

  async disconnect () {
    try {
      await this.databaseService.disconnect()
      await this.cloudService.disconnect()
      await this.setSettings({ backup_pub_key: null })
    } catch (error) {
      throw new Error('Disconnection failed')
    }
  }

  get isAuthenticated () {
    return !!this.pubkey && !!this.db
  }

  get name () {
    return this.username
  }

  get pubkey () {
    return this.keyPair && this.keyPair.publicKey ? this.keyPair.publicKey.toString('hex') : null
  }

  get db () {
    return this.databaseService.db
  }

  get discoveryKey () {
    return this.db.discoveryKey
  }

  async loadSettings () {
    this.settings = await this.db.getJsonValue('memoit-flashcard-settings', {})
  }

  async setSettings (values = { }) {
    const settings = await this.db.getJsonValue('memoit-flashcard-settings', {})
    const newSettings = { ...settings, ...values }
    await this.db.putJson('memoit-flashcard-settings', newSettings)
    return newSettings
  }

  async getSettings (key = null) {
    if (!this.settings) {
      await this.loadSettings()
    }

    return key ? this.settings[key] : this.settings
  }

  getStatuses () {
    return {
      connected: this.cloudService.connected,
      replicated: this.databaseService.replicated
    }
  }
}

module.exports = { UserService }
