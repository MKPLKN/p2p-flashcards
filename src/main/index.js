// const './ipcHandlers'
const path = require('path')

const { app, BrowserWindow, ipcMain } = require('electron')
const { disconnectFromCloud } = require('../../src/main/helpers.js')
const { Flashcard } = require('../../src/main/models/flashcard.js')
const { getMasterComponents } = require('p2p-resources')
const { isAuthenticated } = require('../../src/main/ipcHandlers/authHandlers.js')
const { createFlashcardHandlers } = require('../../src/main/ipcHandlers/flashcardHandlers.js')
require('../../src/main/ipcHandlers/index.js')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

global.mainWindow = null
const createWindow = () => {
  // Create the browser window.
  global.mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    global.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    global.mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  if (['dev', 'development'].includes(process.env.NODE_ENV)) {
    global.mainWindow.webContents.openDevTools()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  await disconnectFromCloud()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async (event) => {
  await disconnectFromCloud()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function bringAppToFront () {
  if (global.mainWindow) {
    if (global.mainWindow.isMinimized()) global.mainWindow.restore()
    global.mainWindow.show()
    global.mainWindow.focus()
  }
}

async function checkForDueFlashcards () {
  if (!isAuthenticated) return

  const now = new Date().getTime()

  const { masterDb } = getMasterComponents()

  const model = new Flashcard({ masterDb })
  const flashcards = await model.getAll()

  const queue = flashcards.filter((fc) => fc.nextAsk.nextDate <= now)
  if (queue.length > 0) {
    bringAppToFront()
    global.mainWindow.webContents.send('flashcards-in-queue', queue)
  }
}
// Check every minute
setInterval(checkForDueFlashcards, 1000 * 60)

/**
 * Endpoints
 *
 */
const flashcardHandlers = createFlashcardHandlers({ })
ipcMain.handle('flashcards/index', flashcardHandlers.index)
ipcMain.handle('flashcards/store', flashcardHandlers.store)
ipcMain.handle('flashcards/destroy', flashcardHandlers.destroy)
