const { beforeStart, cleanUp, createAndLogin } = require('./helpers.js')
const { test } = require('brittle')
const { app } = require('../src/main/helpers.js')

beforeStart()

test('User can connect to the "cloud" and replicate its data', async (t) => {
  t.plan(16)

  const username = 'test-user'
  const password = 'pass'
  await createAndLogin({ username, password })
  const userService = app('user')
  const realMethod = userService.cloudService.connect

  // Fake it
  const fakeKey = 'fake-key-123'
  function fakeMethod (opts) {
    t.ok(opts.username)
    t.ok(opts.keyPair)
    t.ok(opts.keyPair.publicKey)
    t.ok(opts.keyPair.secretKey)
    t.alike(opts.connectTo, fakeKey)
  }
  userService.cloudService.connect = fakeMethod
  userService.connect(fakeKey)

  // Use the real method
  userService.cloudService.connect = realMethod
  const socket = userService.connect(fakeKey)

  // This is the event our database service listens
  app('events').on('cloud:connected', (payload) => {
    t.alike(payload.publicKey, userService.pubkey, 'Pubkey is correct')
  })

  // This is the data that is sent to the remote peer from the database service
  socket.write = async (data) => {
    const msg = JSON.parse(data)
    t.alike(msg.event, 'replicate')
    t.alike(msg.user, userService.username)
    t.alike(msg.pubkey, userService.pubkey)
    t.alike(msg.resources[0].key, userService.databaseService.key)

    // Fake the database's replication function
    userService.db.replicate = (socket) => {
      t.ok(socket.remotePublicKey)
    }

    // This is triggered once the remote peer is joined
    userService.databaseService.swarm.emit('connection', socket)
  }

  app('events').on('db:replicated', ({ socket }) => {
    t.alike(userService.databaseService.replicated, true)
    t.ok(socket.remotePublicKey)
    t.ok(socket.events.get('close'))
    t.ok(socket.events.get('error'))
    t.ok(socket.events.get('connect'))
  })

  socket.emit('connect')

  await cleanUp()
})
