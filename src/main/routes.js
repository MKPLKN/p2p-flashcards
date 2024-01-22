const { ipcMain } = require('electron')
const { authHandlers, userHandlers, cloudHandlers, flashcardHandlers, answerHandlers } = require('./ipcHandlers')

// Auth endpoints
ipcMain.handle('auth/login', authHandlers.login)
ipcMain.handle('auth/restore', authHandlers.restore)
// User endpoints
ipcMain.handle('user/get', userHandlers.get)
ipcMain.handle('user/create', userHandlers.create)
// Cloud endpoints
ipcMain.handle('cloud/connect', cloudHandlers.connect)
ipcMain.handle('cloud/disconnect', cloudHandlers.disconnect)
// Flashcards endpoints
ipcMain.handle('flashcards/index', flashcardHandlers.index)
ipcMain.handle('flashcards/store', flashcardHandlers.store)
ipcMain.handle('flashcards/destroy', flashcardHandlers.destroy)
// Answers endpoints
ipcMain.handle('answers/index', answerHandlers.index)
ipcMain.handle('answers/store', answerHandlers.store)
