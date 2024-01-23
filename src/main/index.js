const path = require('path')
const { app: electronApp, BrowserWindow } = require('electron')
const { app } = require('../../src/main/helpers.js')

require('../../src/main/init.js')
require('../../src/main/routes.js')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  electronApp.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the electronApp.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  if (['dev', 'development'].includes(process.env.NODE_ENV)) {
    mainWindow.webContents.openDevTools()
  }

  app('events').on('cloud:connected', (payload) => {
    if (mainWindow.isDestroyed()) return

    mainWindow.webContents.send('cloud:connected', {
      success: true,
      message: 'Connected!'
    })
  })
  app('events').on('cloud:disconnected', (payload) => {
    if (mainWindow.isDestroyed()) return

    mainWindow.webContents.send('cloud:connected', {
      success: false,
      code: 1,
      message: 'Connection closed'
    })
  })

  app('events').on('db:replicated', (payload) => {
    if (mainWindow.isDestroyed()) return
    mainWindow.webContents.send('db:replicated', {
      success: true,
      message: 'Real-time data backup activated.'
    })
  })
  app('events').on('db:replicated:append', (payload) => {
    if (mainWindow.isDestroyed()) return
    mainWindow.webContents.send('db:replicated:append')
  })
  app('events').on('db:socket:closed', () => {
    if (mainWindow.isDestroyed()) return
    mainWindow.webContents.send('db:replicated', {
      success: false,
      code: 1,
      message: 'Real-time data backup closed.'
    })
  })

  app('events').on('flashcards-in-queue', (flashcards) => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('flashcards-in-queue', flashcards)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electronApp.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electronApp.on('window-all-closed', async () => {
  app('events').emit('window-all-closed')
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

process.on('SIGINT', () => {
  electronApp.quit()
})

app('events').on('final-goodbye', () => {
  electronApp.exit()
})

electronApp.on('before-quit', async (event) => {
  event.preventDefault()
  app('events').emit('before-quit', event)
})

electronApp.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let checkForDueFlashcardsInterval = null

app('events').on('before-quit', async () => {
  try {
    if (app('user').databaseService) {
      await app('user').databaseService.disconnect()
    }
    if (app('user').cloudService) {
      await app('user').cloudService.disconnect()
    }
  } catch (error) {
    console.log(error)
  }
  clearInterval(checkForDueFlashcardsInterval)
  app('events').emit('final-goodbye')
})

async function checkForDueFlashcards () {
  const now = new Date().getTime()
  const flashcards = (await app('user').databaseService.model('flashcard').getAll()).filter((fc) => fc.nextAsk.nextDate <= now)
  if (flashcards.length > 0) {
    app('events').emit('flashcards-in-queue', flashcards)
  }
}

app('events').on('authenticated:success', () => {
  if (!process.env.NODE_ENV !== 'test') {
    // Check every minute, should prob be a configurable with on/off possibility
    checkForDueFlashcardsInterval = setInterval(checkForDueFlashcards, 1000 * 60)
  }
})

app('events').on('window-all-closed', () => {
  clearInterval(checkForDueFlashcardsInterval)
})
