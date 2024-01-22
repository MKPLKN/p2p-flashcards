const fs = require('fs/promises')
const { exec } = require('child_process')
const { promisify } = require('util')
const execProm = promisify(exec)
const { setConfig: setAuthConfig, loadConfigs: loadAuthConfig, createUser } = require('p2p-auth')
const { loadConfigs: loadResourceConfig, setConfig: setResourceConfig } = require('p2p-resources')
const { userService } = require('../src/main/init')

global.is_test_env = true
function beforeStart () {
  setAuthConfig('usersLocation', './tests/users')
  loadAuthConfig()

  setResourceConfig('resourcesLocation', './tests/resources')
  loadResourceConfig()
}

async function createAndLogin (username = 'j-test', password = 'pass') {
  await createUser({ username, password })
  await userService.authenticate({ username, password })
}

async function cleanUp () {
  try {
    // Check if the platform is Windows
    if (process.platform === 'win32') {
      await execProm('rmdir /s /q .\\tests\\users')
      await execProm('rmdir /s /q .\\tests\\resources')
    } else {
      await fs.rm('./tests/users', { recursive: true })
      await fs.rm('./tests/resources', { recursive: true })
    }
  } catch (error) { }
}

module.exports = { beforeStart, cleanUp, createAndLogin }
