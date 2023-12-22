import { ipcMain } from 'electron'
import { getMasterComponents } from 'p2p-resources'
import { Flashcard } from '../models/flashcard'

ipcMain.handle('add-flashcard', async (event, flashcard) => {
  try {
    const { masterDb } = getMasterComponents()

    const model = new Flashcard({ masterDb })
    const card = await model.create(flashcard)

    return { success: true, flashcard: card }
  } catch (error) {
    return { success: false, flashcard: null }
  }
})

ipcMain.handle('update-flashcard', async (event, { id, updatedFlashcard }) => {
  const { masterDb } = getMasterComponents()
  const flashcards = await masterDb.getJsonValue('memoit-flashcards')

  const index = flashcards.findIndex((f) => f.id === id)
  if (index !== -1) {
    flashcards[index] = updatedFlashcard
    await masterDb.putJson('memoit-flashcards', flashcards)
  }
  return flashcards
})

ipcMain.handle('delete-flashcard', async (event, id) => {
  const { masterDb } = getMasterComponents()

  const model = new Flashcard({ masterDb })
  await (await model.find(id)).delete()
})

ipcMain.handle('get-flashcards', async () => {
  const { masterDb } = getMasterComponents()

  const model = new Flashcard({ masterDb })
  const flashcards = await model.getAll()

  for (const fc of flashcards) {
    fc.asks = await model.getAsks(fc.id)
  }

  return flashcards
})
