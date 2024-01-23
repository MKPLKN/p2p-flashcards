const serviceProvider = require('./service-provider')

function app (serviceName) {
  return serviceProvider.get(serviceName)
}

module.exports = { app }
