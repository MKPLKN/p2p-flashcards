import { defineStore } from 'pinia'

const { ipcRenderer } = window

export const useFlashcardStore = defineStore('flashcards', {
  state: () => ({
    flashcards: []
  }),
  getters: {
    hasFlashcards: (state) => state.flashcards.length > 0
  },
  actions: {
    async getAnswers (id) {
      return await ipcRenderer.invoke('answers/index', { id })
    },
    async checkAnswer (id, { userInput, triggerType }) {
      return await ipcRenderer.invoke('answers/store', { id, userInput, triggerType })
    },
    async getFlashcards () {
      this.flashcards = await ipcRenderer.invoke('flashcards/index')
    },
    async addFlashcard (newCard) {
      const { success, flashcard } = await ipcRenderer.invoke(
        'flashcards/store',
        { ...newCard }
      )
      if (success) {
        this.flashcards.push(flashcard)
      } else {
        console.log('Something went wrong!')
      }
    },
    updateFlashcard (id, updatedFlashcard) {
      const index = this.flashcards.findIndex((f) => f.id === id)
      if (index !== -1) {
        this.flashcards[index] = updatedFlashcard
      }
    },
    async deleteFlashcard (id) {
      await ipcRenderer.invoke('flashcards/destroy', id)
      await this.getFlashcards()
    },
    getFlashcardById (id) {
      return this.flashcards.find((f) => f.id === id)
    }
  }
})
