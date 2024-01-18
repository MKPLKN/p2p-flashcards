const { ipcMain } = require('electron')
require('./backupHandlers.js')
require('./authHandlers.js')
require('./flashcardHandlers.js')
require('./answerHandlers.js')

// Flashcard endpoints
const { createFlashcardHandlers } = require('./flashcardHandlers.js')
const flashcardHandlers = createFlashcardHandlers({ })
ipcMain.handle('flashcards/index', flashcardHandlers.index)
ipcMain.handle('flashcards/store', flashcardHandlers.store)
ipcMain.handle('flashcards/destroy', flashcardHandlers.destroy)
