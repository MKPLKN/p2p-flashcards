async function validateCreateRequest (payload) {
  const { id, userInput, triggerType } = payload
  if (!['manual', 'automatic'].includes(triggerType) || !userInput) {
    throw new Error('Invalid answer format')
  }

  const flashcard = await this.databaseService.model('flashcard').find(id)
  if (!flashcard) throw new Error(`Flashcard with "${id}" not found...`)

  return { id, userInput, triggerType, flashcard }
}

function createAnswerHandlers (userService) {
  return {
    index: async (event, payload) => {
      if (event && !payload) payload = event
      const { id } = payload
      const model = await userService.databaseService.model('flashcard').find(id)
      const answers = await model.getAnswers()
      return { success: true, answers }
    },

    store: async (event, payload) => {
      if (event && !payload) payload = event

      const { userInput, triggerType, flashcard } = await validateCreateRequest.call(userService, payload)
      const correctAnswer = flashcard.verifyAnswer(userInput)
      await flashcard.createAnswer({ correct: correctAnswer, triggerType })
      await flashcard.updateStats()

      if (correctAnswer && triggerType === 'automatic') {
        await flashcard.updateNextAsk()
      }

      return { success: true, correctAnswer }
    }
  }
}

module.exports = { createAnswerHandlers }
