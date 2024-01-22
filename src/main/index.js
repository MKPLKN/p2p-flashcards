const path = require('path')
const { app, BrowserWindow } = require('electron')
const { EventService } = require('../../src/main/services/event-service.js')
require('../../src/main/routes.js')
require('../../src/main/init.js')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
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

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  if (['dev', 'development'].includes(process.env.NODE_ENV)) {
    mainWindow.webContents.openDevTools()
  }

  EventService.on('cloud:connected', (payload) => {
    if (mainWindow.isDestroyed()) return

    mainWindow.webContents.send('cloud:connected', {
      success: true,
      message: 'Connected!'
    })
  })
  EventService.on('cloud:disconnected', (payload) => {
    if (mainWindow.isDestroyed()) return

    mainWindow.webContents.send('cloud:connected', {
      success: false,
      code: 1,
      message: 'Connection closed'
    })
  })

  EventService.on('db:replicated', (payload) => {
    if (mainWindow.isDestroyed()) return
    mainWindow.webContents.send('db:replicated', {
      success: true,
      message: 'Real-time data backup activated.'
    })
  })
  EventService.on('db:replicated:append', (payload) => {
    if (mainWindow.isDestroyed()) return
    mainWindow.webContents.send('db:replicated:append')
  })
  EventService.on('db:socket:closed', () => {
    if (mainWindow.isDestroyed()) return
    mainWindow.webContents.send('db:replicated', {
      success: false,
      code: 1,
      message: 'Real-time data backup closed.'
    })
  })

  EventService.on('flashcards-in-queue', (flashcards) => {
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
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  EventService.emit('window-all-closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.on('SIGINT', () => {
  app.quit()
})

EventService.on('final-goodbye', () => {
  app.exit()
})

app.on('before-quit', async (event) => {
  event.preventDefault()
  EventService.emit('before-quit', event)
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
