const { ipcMain } = require('electron')
const { getMasterComponents } = require('p2p-resources')
const { Flashcard } = require('../models/flashcard')

ipcMain.handle('get-answers', async (event, payload) => {
  const { id } = payload
  const { masterDb } = getMasterComponents()

  const model = new Flashcard({ masterDb })
  const answers = (await model.getAnswers(id)).reverse()
  return answers
})

ipcMain.handle('check-answer', async (event, payload) => {
  const { id, userInput, triggerType } = payload
  if (!['manual', 'automatic'].includes(triggerType)) {
    throw new Error('Invalid trigger type')
  }
  const { masterDb } = getMasterComponents()

  const model = new Flashcard({ masterDb })
  const card = await model.find(id)
  if (!card) throw new Error(`Flashcard with "${id}" not found...`)

  const correctAnswer = model.verifyAnswer(userInput)
  await model.createAnswer({
    correct: correctAnswer,
    triggerType
  })
  await model.updateStats()

  if (correctAnswer && triggerType === 'automatic') {
    await model.updateNextAsk()
  }

  return { correctAnswer }
})
