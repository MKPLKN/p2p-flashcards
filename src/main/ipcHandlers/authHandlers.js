const { ipcMain } = require('electron')
const { createUser, authUser, Memory, restoreUser } = require('p2p-auth')
const { getMasterComponents, initMasterComponents } = require('p2p-resources')
const { backupService, connectToCloud } = require('../helpers')

let isAuthenticated = false
ipcMain.handle('user', async (event) => {
  try {
    const { masterDb } = getMasterComponents()
    const settings = await masterDb.getJsonValue('memoit-flashcard-settings', {})
    isAuthenticated = !!Memory.getKeyPair('pubkey')

    const { connected, replicated } = backupService
    return { isAuthenticated, settings, backupService: { connected, replicated } }
  } catch (error) {
    isAuthenticated = false
    return { isAuthenticated }
  }
})

ipcMain.handle('restore-user-attempt', async (event, userData) => {
  const { username, password, confirmPassword, seed: seedPhrase } = userData
  try {
    if (password !== confirmPassword) {
      throw new Error('Password and confirmPassword should match.')
    }

    await restoreUser({ seedPhrase, username, password })
    await initMasterComponents()

    return { success: true }
  } catch (error) {
    return { succress: false, error }
  }
})

ipcMain.handle('create-user-attempt', async (event, userData) => {
  const { username, password } = userData
  try {
    const { mnemonic } = await createUser({ username, password })
    await initMasterComponents()
    return { success: true, seed: mnemonic }
  } catch (error) {
    return { succress: false, error }
  }
})

ipcMain.handle('login-attempt', async (event, loginData) => {
  const { username, password } = loginData
  try {
    const { keyPair } = await authUser({ username, password })
    const { masterDb } = await initMasterComponents()

    const settings = await masterDb.getJsonValue('memoit-flashcard-settings', {})
    if (settings.backup_pub_key) {
      connectToCloud({ masterDb, pubkey: settings.backup_pub_key })
    }

    isAuthenticated = !!(keyPair.publicKey && keyPair.secretKey)
    return { success: isAuthenticated, settings }
  } catch (error) {
    console.log(error)
    return { error, success: false }
  }
})

module.exports = { isAuthenticated }
