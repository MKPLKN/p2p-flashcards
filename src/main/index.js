import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Flashcard } from './models/flashcard'
import { getMasterComponents } from 'p2p-resources'
import { isAuthenticated } from './ipcHandlers/authHandlers'
import './ipcHandlers'
import { disconnectFromCloud } from './helpers'

global.mainWindow = null
function createWindow () {
  // Create the browser window.
  global.mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  global.mainWindow.on('ready-to-show', () => {
    global.mainWindow.show()
  })

  global.mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    global.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    global.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  await disconnectFromCloud()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let isQuitting = false
app.on('before-quit', async (event) => {
  if (!isQuitting) {
    event.preventDefault()
    await disconnectFromCloud()
    isQuitting = true
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

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
