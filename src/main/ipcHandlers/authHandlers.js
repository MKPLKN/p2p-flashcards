import { ipcMain } from 'electron'
import { createUser, authUser, Memory } from 'p2p-auth'
import { initMasterComponents } from 'p2p-resources'

let isAuthenticated = false
ipcMain.handle('check-auth-status', async (event) => {
  try {
    isAuthenticated = !!Memory.getKeyPair('pubkey')
  } catch (error) {}

  return { isAuthenticated }
})

ipcMain.handle('create-user-attempt', async (event, userData) => {
  const { username, password } = userData
  try {
    await createUser({ username, password })
    await initMasterComponents()
    return { success: true }
  } catch (error) {
    return { succress: false, error }
  }
})

ipcMain.handle('login-attempt', async (event, loginData) => {
  const { username, password } = loginData
  try {
    const { keyPair } = await authUser({ username, password })
    await initMasterComponents()
    isAuthenticated = !!(keyPair.publicKey && keyPair.secretKey)
    return { success: isAuthenticated }
  } catch (error) {
    return { error, success: false }
  }
})

export { isAuthenticated }
