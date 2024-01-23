// This runner is auto-generated by Brittle

runTests()

async function runTests () {
  const test = (await import('brittle')).default

  test.pause()

  await import('./answers.test.js')
  await import('./flashcard.test.js')
  await import('./helpers.js')
  await import('./user.test.js')

  test.resume()
}
