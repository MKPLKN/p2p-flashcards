const { test } = require('brittle')
const { beforeStart, cleanUp, createAndLogin } = require('./helpers.js')
const { flashcardHandlers } = require('../src/main/ipcHandlers/index.js')
const { userService } = require('../src/main/init.js')

beforeStart()

test('flashcards/store', async (t) => {
  await createAndLogin()
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
    response = await flashcardHandlers.store(payload)
    t.is(response.success, false)
  }

  // Valid
  const model = userService.databaseService.model('flashcard')
  t.is((await model.getAll()).length, 0)
  response = await flashcardHandlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  t.is(response.success, true)
  t.is((await model.getAll()).length, 1)

  await cleanUp()
})

test('flashcards/index', async (t) => {
  await createAndLogin()
  const model = userService.databaseService.model('flashcard')

  t.is((await model.getAll()).length, 0)
  const { flashcard: firstCard } = await flashcardHandlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: secondCard } = await flashcardHandlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: thirdCard } = await flashcardHandlers.store({
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
  await createAndLogin()
  const model = userService.databaseService.model('flashcard')

  const { flashcard: firstCard } = await flashcardHandlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: secondCard } = await flashcardHandlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })
  const { flashcard: thirdCard } = await flashcardHandlers.store({
    question: 'Test question',
    answer: 'Answer',
    confirmation: 'Answer'
  })

  let flashcards = await model.getAll()
  t.is(flashcards.length, 3)

  // Delete
  await model.find(secondCard.id)
  t.unlike(null, model.flashcard)
  await flashcardHandlers.destroy(secondCard.id)
  await model.find(secondCard.id)
  t.is(null, model.flashcard)

  flashcards = await model.getAll()
  t.is(flashcards.length, 2)
  t.is(true, firstCard.id && flashcards[0].id === firstCard.id)
  t.is(true, thirdCard.id && flashcards[1].id === thirdCard.id)

  await cleanUp()
})
