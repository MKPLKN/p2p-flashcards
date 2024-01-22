const { CloudService } = require('./services/cloud-service')
const { EventService } = require('./services/event-service')
const { UserService } = require('./services/user-service')

const cloudService = new CloudService()
const userService = new UserService(cloudService)

EventService.on('before-quit', async () => {
  try {
    if (userService.databaseService) {
      await userService.databaseService.disconnect()
    }
    if (userService.cloudService) {
      await userService.cloudService.disconnect()
    }
  } catch (error) {
    console.log(error)
  }
  clearInterval(checkForDueFlashcardsInterval)
  EventService.emit('final-goodbye')
})

async function checkForDueFlashcards () {
  const now = new Date().getTime()
  const flashcards = (await userService.databaseService.model('flashcard').getAll()).filter((fc) => fc.nextAsk.nextDate <= now)
  if (flashcards.length > 0) {
    EventService.emit('flashcards-in-queue', flashcards)
  }
}

let checkForDueFlashcardsInterval = null
EventService.on('authenticated:success', () => {
  if (!global.is_test_env) {
    // Check every minute, should prob be a configurable with on/off possibility
    checkForDueFlashcardsInterval = setInterval(checkForDueFlashcards, 1000 * 60)
  }
})
EventService.on('window-all-closed', () => {
  clearInterval(checkForDueFlashcardsInterval)
})

module.exports = { userService, checkForDueFlashcardsInterval }
