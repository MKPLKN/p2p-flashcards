const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const MIN_IN_MS = 60 * 1000
const H_IN_MS = 60 * MIN_IN_MS
// 4 Testing
// const H_IN_MS = MIN_IN_MS

const schedule = [
  {
    count: 10, // If the flashcard is asked <= 6 times
    min: H_IN_MS * 4,
    max: H_IN_MS * 8,
    interval: function () {
      return getRandomNumberBetween(this.min, this.max)
    }
  },
  {
    count: 17,
    min: H_IN_MS * 8,
    max: H_IN_MS * 24,
    interval: function () {
      return getRandomNumberBetween(this.min, this.max)
    }
  },
  {
    count: 25,
    min: H_IN_MS * 24,
    max: H_IN_MS * 24 * 4.5,
    interval: function () {
      return getRandomNumberBetween(this.min, this.max)
    }
  },
  {
    count: Infinity,
    min: H_IN_MS * 24 * 5,
    max: H_IN_MS * 24 * 7,
    interval: function () {
      return getRandomNumberBetween(this.min, this.max)
    }
  }
]

function getRandomNumberBetween (min, max) {
  return (Math.random() * (max - min) + min) | 0
}

class Flashcard {
  constructor ({ masterDb, id }) {
    this.masterDb = masterDb
    this.prefix = 'memoit-flashcard'
    this.key = `${this.prefix}:id:${id}`
    this.flashcard = null
  }

  indexes (flashcard) {
    const { id, createdAt, updatedAt } = flashcard
    return [
      `${this.prefix}:id:${id}`,
      createdAt ? `${this.prefix}:created:${createdAt}` : null,
      updatedAt ? `${this.prefix}:updated:${updatedAt}` : null
    ].filter((i) => !!i)
  }

  getFullKey (id) {
    return `${this.prefix}:id:${id}`
  }

  resetStats () {
    return {
      timesAnswered: 0,
      timesAsked: 0, // How many times this is asked automatically
      timesCorrect: 0,
      timesWrong: 0
    }
  }

  hashAnswer (answer) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .pbkdf2Sync(answer, salt, 1000, 64, 'sha512')
      .toString('hex')
    return { salt, hash }
  }

  verifyAnswer (inputAnswer) {
    if (!this.flashcard) {
      throw new Error('Flashcard not found')
    }

    const { salt, hash } = this.flashcard.answer
    const hex = crypto
      .pbkdf2Sync(inputAnswer, salt, 1000, 64, 'sha512')
      .toString('hex')

    return hex === hash
  }

  async getAnswers (flashcardID) {
    const id = flashcardID || this.flashcard.id
    return await this.masterDb.getJsonValue(
        `memoit-flashcard-answers:${id}`,
        []
    )
  }

  async updateStats () {
    const stats = this.flashcard.stats || this.resetStats()

    const answers = await this.getAnswers()
    const asks = await this.getAsks()

    stats.timesAnswered = answers.length
    stats.timesAsked = asks.length
    stats.timesCorrect = answers.filter(a => a.correct).length
    stats.timesWrong = answers.filter(a => !a.correct).length

    await this.update({ stats })
  }

  async createAnswer (attributes) {
    const id = this.flashcard.id
    const { correct, triggerType } = attributes
    if (!id || [correct, triggerType].includes(undefined)) {
      throw new Error('Invalid attributes for an answer')
    }
    await this.masterDb.push(`memoit-flashcard-answers:${id}`, {
      id: uuidv4(),
      flashcard_id: id,
      correct,
      triggerType,
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime()
    })
  }

  async getAsks (flashcardID) {
    const id = flashcardID || this.flashcard.id
    return await this.masterDb.getJsonValue(`memoit-flashcard-asks:${id}`, [])
  }

  async updateNextAsk () {
    const { id, nextAsk } = this.flashcard
    await this.masterDb.push(`memoit-flashcard-asks:${id}`, nextAsk)
    await this.update({ nextAsk: await this.getNextAsk({ id }) })
  }

  async getNextAsk (flashcard) {
    const { id } = flashcard
    const asks = await this.getAsks(id)
    const askCount = asks.length

    const currentSchedule = schedule.find((s) => askCount <= s.count)
    const interval = currentSchedule.interval()
    const nextDate = new Date().getTime() + interval

    return {
      nextDate,
      interval,
      min: currentSchedule.min,
      max: currentSchedule.max,
      count: currentSchedule.count
    }
  }

  async find (id) {
    const flashcard = await this.masterDb.getJsonValue(this.getFullKey(id))

    this.flashcard = flashcard || null

    return this
  }

  async create (flashcard) {
    const now = new Date().getTime()
    flashcard.id = uuidv4()
    flashcard.answer = this.hashAnswer(flashcard.answer)
    flashcard.nextAsk = await this.getNextAsk(flashcard)
    flashcard.stats = this.resetStats()
    flashcard.updatedAt = now
    flashcard.createdAt = now

    for (const index of this.indexes(flashcard)) {
      await this.masterDb.putJson(index, flashcard)
    }

    return flashcard
  }

  async update (updatedContent) {
    if (!this.flashcard) {
      throw new Error('Flashcard not found')
    }

    this.flashcard.updatedAt = new Date().getTime()
    Object.assign(this.flashcard, updatedContent)
    for (const index of this.indexes(this.flashcard)) {
      await this.masterDb.putJson(index, this.flashcard)
    }

    return this
  }

  async delete () {
    if (!this.flashcard) {
      throw new Error('Flashcard not found')
    }

    const { id } = this.flashcard
    for (const index of this.indexes(this.flashcard)) {
      await this.masterDb.del(index)
    }
    this.masterDb.del(`memoit-flashcard-answers:${id}`)
    this.masterDb.del(`memoit-flashcard-asks:${id}`)

    return this
  }

  async getAll () {
    const stream = this.masterDb.createReadStream({
      gte: Buffer.from(`${this.prefix}:created:`),
      lte: Buffer.from(`${this.prefix}:created:9999999999999`)
    })

    const cards = []
    for await (const data of stream) {
      const card = JSON.parse(data.value)
      if (card && card.id) {
        card.answers = await this.getAnswers(card.id)
        cards.push(card)
      }
    }

    return cards
  }
}

module.exports = { Flashcard }
