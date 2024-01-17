const fs = require('fs/promises')
const { test } = require('brittle')
const { createUser, setConfig: setAuthConfig, loadConfigs: loadAuthConfig } = require('p2p-auth')
const { loadConfigs: loadResourceConfig, setConfig: setResourceConfig, initMasterComponents } = require('p2p-resources')
const { createFlashcardHandlers } = require('../src/main/ipcHandlers/flashcardHandlers.js')
const { Flashcard } = require('../src/main/models/flashcard.js')

setAuthConfig('usersLocation', './tests/users')
loadAuthConfig()

setResourceConfig('resourcesLocation', './tests/resources')
loadResourceConfig()

async function cleanUp () {
  await fs.rm('./tests/users', { recursive: true })
  await fs.rm('./tests/resources', { recursive: true })
}

test('flashcards/store', async (t) => {
  await createUser({ username: 'j-test', password: 'pass' })
  const { masterDb: db } = await initMasterComponents()

  const handlers = createFlashcardHandlers({ db })
  let response

  // Invalid
  const invalid = [
    { question: '', answer: '', confirmation: '' },
    { question: 'Question', answer: '', confirmation: '' },
    { question: 'Question', answer: 'Answer', confirmation: '' },
    { question: '', answer: '', confirmation: 'Confirmation' },
    { question: '', answer: 'Answer', confirmation: 'Confirmation' },
    { question: 'Question', answer: '', confirmation: 'Confirmation' },
    { question: '', answer: 'Answer', confirmation: '' },
    // Answer and confirmation should match
    { question: 'Question', answer: 'Answer', confirmation: 'Confirmation' }
  ]
  for await (const payload of invalid) {
    response = await handlers.store(payload)
    t.is(response.success, false)
  }

  // Valid
  const model = new Flashcard({ masterDb: db })
  t.is((await model.getAll()).length, 0)
  response = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  t.is(response.success, true)
  t.is((await model.getAll()).length, 1)

  await cleanUp()
})

test('flashcards/index', async (t) => {
  await createUser({ username: 'j-test', password: 'pass' })
  const { masterDb: db } = await initMasterComponents()
  const model = new Flashcard({ masterDb: db })
  const handlers = createFlashcardHandlers({ db })

  t.is((await model.getAll()).length, 0)
  const { flashcard: firstCard } = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: secondCard } = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: thirdCard } = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const flashcards = await model.getAll()
  t.is(flashcards.length, 3)
  t.is(true, firstCard.id && flashcards[0].id === firstCard.id)
  t.is(true, secondCard.id && flashcards[1].id === secondCard.id)
  t.is(true, thirdCard.id && flashcards[2].id === thirdCard.id)

  await cleanUp()
})

test('flashcards/destroy', async (t) => {
  await createUser({ username: 'j-test', password: 'pass' })
  const { masterDb: db } = await initMasterComponents()
  const model = new Flashcard({ masterDb: db })
  const handlers = createFlashcardHandlers({ db })

  const { flashcard: firstCard } = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: secondCard } = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: thirdCard } = await handlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })

  let flashcards = await model.getAll()
  t.is(flashcards.length, 3)

  // Delete
  await model.find(secondCard.id)
  t.unlike(null, model.flashcard)
  await handlers.destroy(secondCard.id)
  await model.find(secondCard.id)
  t.is(null, model.flashcard)

  flashcards = await model.getAll()
  t.is(flashcards.length, 2)
  t.is(true, firstCard.id && flashcards[0].id === firstCard.id)
  t.is(true, thirdCard.id && flashcards[1].id === thirdCard.id)

  await cleanUp()
})
