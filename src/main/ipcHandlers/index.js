const { app } = require('../helpers.js')
const { createUserHandlers } = require('./user-handlers.js')
const { createAuthHandlers } = require('./auth-handlers.js')
const { createCloudHandlers } = require('./cloud-handlers.js')
const { createFlashcardHandlers } = require('./flashcard-handlers.js')
const { createAnswerHandlers } = require('./answer-handlers.js')

const userService = app('user')
const userHandlers = createUserHandlers(userService)
const authHandlers = createAuthHandlers(userService)
const cloudHandlers = createCloudHandlers(userService)
const flashcardHandlers = createFlashcardHandlers(userService)
const answerHandlers = createAnswerHandlers(userService)

module.exports = { userHandlers, authHandlers, cloudHandlers, flashcardHandlers, answerHandlers }
