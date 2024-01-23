const serviceProvider = require('../service-provider')
const { EventService } = require('./event-service')
const { CloudService } = require('./cloud-service')
const { UserService } = require('./user-service')

function registerTestServices () {
  serviceProvider.register(['events', 'eventService', 'EventService'], EventService)

  const { TestSwarmService } = require('../../../tests/services/swarm-service.test')
  const { TestDHTService } = require('../../../tests/services/dht-service.test')

  const swarmService = new TestSwarmService()
  const dhtService = new TestDHTService()
  const cloudService = new CloudService()
  const userService = new UserService(cloudService)

  serviceProvider.register(['cloud', 'cloudService'], cloudService)
  serviceProvider.register(['user', 'userService'], userService)
  serviceProvider.register('DHT', dhtService)
  serviceProvider.register('swarm', swarmService)
}

function registerProdServices () {
  serviceProvider.register(['events', 'eventService', 'EventService'], EventService)

  const { SwarmService } = require('./swarm-service')
  const { DHTService } = require('./dht-service')

  const swarmService = new SwarmService()
  const dhtService = new DHTService()
  const cloudService = new CloudService()
  const userService = new UserService(cloudService)

  serviceProvider.register(['cloud', 'cloudService'], cloudService)
  serviceProvider.register(['user', 'userService'], userService)
  serviceProvider.register('DHT', dhtService)
  serviceProvider.register('swarm', swarmService)
}

const registerServices = () => {
  if (process.env.NODE_ENV === 'test') {
    registerTestServices()
  } else {
    registerProdServices()
  }
}

module.exports = { registerServices }
