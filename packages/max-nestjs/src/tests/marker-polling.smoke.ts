/**
 * Автономный smoke-тест опроса с хранилищем маркера (без сети и Nest).
 * Запуск: npm run test:marker-polling
 *
 * Проверяет: опрос начинается с маркера хранилища, обновления пачки обрабатываются по очереди, маркер сохраняется
 * после обработки пачки, сбой запроса повторяется (после паузы в 5 с), а не роняет опрос.
 */
import { Bot, Context } from '@maxhub/max-bot-api'
import { MarkerPolling } from '../polling'
import { MaxUpdate } from '../types'

interface Batch {
  marker: number
  updates: number[]
}

const log: string[] = []
const store = { marker: 7 as number | null }
const batches: Batch[] = [
  { marker: 9, updates: [8, 9] },
  { marker: 10, updates: [10] }
]
const calls = { getUpdates: 0 }

const polling = new MarkerPolling({
  bot: {
    botInfo: undefined,
    api: {
      getMyInfo: () => Promise.resolve({ user_id: 1, username: 'bot' }),
      getSubscriptions: () => Promise.resolve([]),
      getUpdates: async (_types: unknown, { marker }: { marker?: number }) => {
        calls.getUpdates += 1
        log.push(`get:${marker}`)

        // второй запрос падает — опрос должен повторить его с тем же маркером
        if (calls.getUpdates === 2) {
          throw new TypeError('fetch failed')
        }

        const batch = batches.shift()

        if (!batch) {
          polling.stop()
          return { marker: marker ?? 0, updates: [] }
        }

        return {
          marker: batch.marker,
          updates: batch.updates.map((seq) => ({ update_type: 'message_created', seq }))
        }
      }
    }
  } as unknown as Bot<Context>,
  store: {
    load: () => Promise.resolve(store.marker),
    save: async (marker) => {
      log.push(`save:${marker}`)
      store.marker = marker
    }
  },
  handle: async (update: MaxUpdate) => {
    const { seq } = update as unknown as { seq: number }

    // медленная первая запись: обработка по очереди не даёт второй обогнать её
    await new Promise((resolve) => setTimeout(resolve, seq === 8 ? 30 : 0))
    log.push(`handle:${seq}`)
  }
})

const expected = [
  'get:7',
  'handle:8',
  'handle:9',
  'save:9',
  'get:9',
  'get:9',
  'handle:10',
  'save:10',
  'get:10'
]

const main = async () => {
  const timer = setTimeout(() => {
    console.error('timeout', log)
    process.exit(1)
  }, 20000)

  await polling.run()
  clearTimeout(timer)

  const isOk = JSON.stringify(log) === JSON.stringify(expected)

  console.log(isOk ? 'marker-polling smoke: ok' : 'marker-polling smoke: FAILED')
  console.log(log.join(' → '))
  process.exit(isOk ? 0 : 1)
}

main()
