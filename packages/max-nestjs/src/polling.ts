import { Logger } from '@nestjs/common'
import { setTimeout as sleep } from 'node:timers/promises'
import { Bot, Context, Webhook } from '@maxhub/max-bot-api'
import { MaxMarkerStore } from './interfaces'
import { MaxUpdate } from './types'

const RETRY_BASE_MS = 5000
const RETRY_MAX_MS = 60000

interface MarkerPollingParams {
  bot: Bot<Context>
  store: MaxMarkerStore
  handle: (update: MaxUpdate) => Promise<void>
}

const messageOf = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Long polling с маркером из хранилища приложения. Без маркера MAX отдаёт только последнее обновление, поэтому опрос
 * начинается с сохранённого: после перезапуска приходит всё, что пришло за простой. Обновления пачки обрабатываются по
 * очереди — порядок сообщений одного человека сохраняется; маркер сохраняется после обработки пачки, и сбой посреди
 * неё повторит пачку — повтор отсекает приложение. Сбой сети, лимит и ошибка сервера MAX — повтор с паузой, которая
 * растёт до минуты.
 */
export class MarkerPolling {
  private readonly abortController = new AbortController()

  constructor(private readonly params: MarkerPollingParams) {}

  async run() {
    const { bot, store, handle } = this.params
    const { signal } = this.abortController

    bot.botInfo ??= await bot.api.getMyInfo()
    await Webhook.clearSubscriptions(bot.api)

    const state = { marker: await store.load(), delay: RETRY_BASE_MS }

    while (!signal.aborted) {
      try {
        const { updates, marker } = await bot.api.getUpdates([], {
          marker: state.marker ?? undefined,
          signal
        })

        for (const update of updates) {
          await handle(update)
        }

        const isMoved = typeof marker === 'number' && marker !== state.marker

        if (isMoved) {
          await store.save(marker)
          state.marker = marker
        }

        state.delay = RETRY_BASE_MS
      } catch (error) {
        if (signal.aborted) {
          return
        }

        Logger.warn(
          `MAX polling failed, retry in ${state.delay / 1000}s: ${messageOf(error)}`,
          'MaxBot'
        )
        await sleep(state.delay, undefined, { signal }).catch(() => undefined)
        state.delay = Math.min(state.delay * 2, RETRY_MAX_MS)
      }
    }
  }

  stop() {
    this.abortController.abort()
  }
}
