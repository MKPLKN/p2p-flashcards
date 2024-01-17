import { Flashcard } from '../models/flashcard.js'
import { getMasterDatabase } from '../helpers.js'

function validateCreateRequest (payload) {
  const { question, answer, confirmation } = payload
  if (!question || !answer || !confirmation) {
    throw new Error('Invalid flashcard')
  }

  if (answer !== confirmation) {
    throw new Error('Invalid flashcard')
  }
}

export function createFlashcardHandlers ({ db }) {
  return {
    index: async () => {
      const model = new Flashcard({ masterDb: db || getMasterDatabase() })
      const flashcards = await model.getAll()

      for (const fc of flashcards) {
        fc.asks = await model.getAsks(fc.id)
      }

      return flashcards
    },

    store: async (event, payload) => {
      if (event && !payload) payload = event

      try {
        validateCreateRequest(payload)
        const model = new Flashcard({ masterDb: db || getMasterDatabase() })
        const card = await model.create(payload)

        return { success: true, flashcard: card }
      } catch (error) {
        return { success: false, flashcard: null }
      }
    },

    destroy: async (event, payload) => {
      if (event && !payload) payload = event
      const model = new Flashcard({ masterDb: db || getMasterDatabase() })
      await (await model.find(payload)).delete()
    }
  }
}
