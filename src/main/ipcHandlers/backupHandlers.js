import { ipcMain } from 'electron'
import { getMasterComponents } from 'p2p-resources'
import { connectToCloud, disconnectFromCloud } from '../helpers.js'

ipcMain.handle('disconnect', async (event, payload) => {
  try {
    const { masterDb } = getMasterComponents()
    await disconnectFromCloud()
    const settings = await masterDb.getJsonValue('memoit-flashcard-settings', {})
    await masterDb.putJson('memoit-flashcard-settings', { ...settings, backup_pub_key: null })

    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
})

ipcMain.handle('save-and-connect', async (event, payload) => {
  try {
    const { pubkey } = payload
    if (!pubkey) return
    const { masterDb } = getMasterComponents()

    const settings = await masterDb.getJsonValue('memoit-flashcard-settings', {})
    if (settings.backup_pub_key !== pubkey) {
      await masterDb.putJson('memoit-flashcard-settings', { ...settings, backup_pub_key: pubkey })
    }

    connectToCloud({ masterDb, pubkey })

    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
})
