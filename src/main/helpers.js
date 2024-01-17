const DHT = require('hyperdht')
const Hyperswarm = require('hyperswarm')
const goodbye = require('graceful-goodbye')
const b4a = require('b4a')
const { Memory } = require('p2p-auth')
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

const initSwarm = (opts = {}) => {
  const swarm = new Hyperswarm(opts)

  goodbye(() => swarm.destroy(), 1)

  return {
    swarm,
    async connect (topic, onsocket) {
      swarm.on('connection', onsocket)

      console.log('Connect...')
      const discovery = swarm.join(
        typeof topic === 'string' ? b4a.from(topic, 'hex') : topic
      )
      await discovery.flushed()
      console.log(`Connected to ${topic}`)

      return swarm
    }
  }
}

const backupService = {
  connected: false,
  replicated: false,
  swarm: null,
  connection: null,
  swarmConnection: null
}

async function disconnectFromCloud () {
  if (backupService.connection) {
    await backupService.connection.destroy({ force: true })
  }
  if (backupService.swarm) {
    await backupService.swarm.destroy({ force: true })
  }

  backupService.connected = false
  backupService.replicated = false
  backupService.swarm = null
  backupService.connection = null
  backupService.swarmConnection = null
}

async function connectToCloud (opts = {}) {
  const { masterDb, pubkey, replicated, connected } = opts

  const pubkeyBuffer = typeof pubkey === 'string' ? b4a.from(pubkey, 'hex') : pubkey
  const node = new DHT({ keyPair: Memory.getKeyPair() })
  const conn = node.connect(pubkeyBuffer)
  conn.on('close', () => {
    console.log('DHT connection closed!')
    backupService.connected = false
    if (!global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('event:backup-service:connect', {
        success: backupService.connected,
        code: 1,
        message: 'Connection closed'
      })
    }
  })
  conn.on('error', (err) => {
    console.log(err)
  })

  conn.on('connect', () => {
    if (connected && typeof connected === 'function') {
      connected({ socket: conn })
    }

    backupService.connected = true
    backupService.connection = conn
    if (!global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('event:backup-service:connect', {
        success: backupService.connected,
        message: 'Connected!'
      })
    }
    handleReplication({ conn })
  })

  async function handleReplication ({ conn }) {
    const swarm = (initSwarm({ }))
    backupService.swarm = swarm.swarm
    await swarm.connect(masterDb.discoveryKey, async (swarmConnection) => {
      const remotePubkey = swarmConnection.remotePublicKey.toString('hex')

      swarmConnection.on('close', () => {
        console.log('Swarm connection closed!')
        backupService.replicated = false
        if (!global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('event:backup-service:replicate', {
            success: backupService.replicated,
            code: 1,
            message: 'Real-time data backup closed.'
          })
        }
      })

      swarmConnection.on('error', (err) => {
        console.log(err)
      })

      console.log(`New connection to replicate "${masterDb.key.toString('hex')}" from "${remotePubkey}"`)

      masterDb.replicate(swarmConnection)
      backupService.replicated = true
      backupService.swarmConnection = swarmConnection
      if (!global.mainWindow.isDestroyed()) {
        global.mainWindow.webContents.send('event:backup-service:replicate', {
          success: backupService.replicated,
          message: 'Real-time data backup activated.'
        })
      }
      if (replicated && typeof replicated === 'function') {
        replicated({ socket: swarmConnection })
      }
    })

    const payload = {
      event: 'replicate',
      user: Memory.getUsername(),
      pubkey: Memory.getKeyPair('pubkey'),
      resources: [{ key: masterDb.key.toString('hex') }]
    }
    conn.write(JSON.stringify(payload))
  }
}

module.exports = {
  wait,
  backupService,
  getMasterDatabase,
  disconnectFromCloud,
  connectToCloud
}
