const { test } = require('brittle')
const { cleanUp, beforeStart, createAndLogin } = require('./helpers.js')
const { flashcardHandlers, answerHandlers } = require('../src/main/ipcHandlers/index.js')

beforeStart()

async function startUp () {
  await createAndLogin()
  const { flashcard } = await flashcardHandlers.store({ question: 'Question', answer: 'Answer', confirmation: 'Answer' })
  return { flashcard }
}

test('answers/store', async (t) => {
  const { flashcard } = await startUp()

  // Wrong answer
  const response = await answerHandlers.store({
    id: flashcard.id,
    userInput: 'Wrong',
    triggerType: 'manual'
  })
  t.is(response.success, true)
  t.is(response.correctAnswer, false)

  let answersResponse = await answerHandlers.index({ id: flashcard.id })
  t.is(answersResponse.answers.length, 1)
  t.is(answersResponse.answers.filter(a => a.correct === false).length, 1)
  t.is(answersResponse.answers.filter(a => a.correct === true).length, 0)

  // Correct answer
  const response2 = await answerHandlers.store({
    id: flashcard.id,
    userInput: 'Answer',
    triggerType: 'manual'
  })
  t.is(response2.success, true)
  t.is(response2.correctAnswer, true)

  answersResponse = await answerHandlers.index({ id: flashcard.id })
  t.is(answersResponse.answers.length, 2)
  t.is(answersResponse.answers.filter(a => a.correct === false).length, 1)
  t.is(answersResponse.answers.filter(a => a.correct === true).length, 1)

  await cleanUp()
})

test('answers/index', async (t) => {
  const { flashcard } = await startUp()

  const response = await answerHandlers.index({ id: flashcard.id })
  t.is(response.success, true)
  t.is(response.answers.length, 0)

  await cleanUp()
})
