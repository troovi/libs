import { getRandomIntString } from '../../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'

import { EventDispatcher } from '@troovi/utils-js'
import { KuCoinSpotApi } from '../../api/spot/api'
import { Topics } from './subscriptions'
import { AnyKuCoinSpotMessage } from './messages'

interface Options {
  keepAlive?: boolean
  endpoint: string
  pingInterval: number
  callbacks: WebSocketCallbacks & {
    onMessage: (data: AnyKuCoinSpotMessage) => void
  }
}

interface MainOptions extends Omit<Options, 'endpoint' | 'pingInterval'> {
  api: KuCoinSpotApi
}

export const createKuCoinSpotPublicStream = async ({ api, ...options }: MainOptions) => {
  const { token, instanceServers } = await api.getWSPublicInfo()

  const server = instanceServers[0]

  return new KuCoinSpotPublicStream({
    endpoint: `${server.endpoint}?token=${token}`,
    pingInterval: server.pingInterval,
    ...options
  })
}

// Max subscription count limitation - 400 per session
export class KuCoinSpotPublicStream extends WebsocketBase {
  private streams: string[] = []
  private responses = new EventDispatcher<string>()

  constructor({ endpoint, pingInterval, keepAlive, callbacks }: Options) {
    super(endpoint, {
      keepAlive,
      service: `kucoin-spot`,
      callbacks: {
        ...callbacks,
        onOpen: () => {
          setInterval(() => {
            if (this.isConnected()) {
              this.send({ id: +getRandomIntString(8), type: 'ping' })
            }
          }, pingInterval)

          callbacks.onOpen()
        },
        onMessage: (data) => {
          const raw = data.toString()
          const response = JSON.parse(raw)

          if (response.id) {
            if (response.type === 'pong') {
              this.logger.log(`Recieved "pong" message`, 'STREAM')
              return
            }

            this.logger.log(`Interaction message: ${raw}`, 'STREAM')
            this.responses.emit(response.id.toString(), response.type)

            return
          }

          callbacks.onMessage(response)
        }
      }
    })
  }

  private request(topic: string, method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      this.logger.verbose(`${method}: [${id}] ${topic}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message === 'ack') {
          resolve()
        } else {
          this.logger.error(message, method)
          reject()
        }
      })

      this.send({ id: id, type: method, topic, response: true })
    })
  }

  subscribe(getTopic: (subscriptions: typeof Topics) => string) {
    const topic = getTopic(Topics)

    return this.request(topic, 'subscribe').then(() => {
      this.streams.push(topic)
    })
  }

  unsubscribe(getTopic: (subscriptions: typeof Topics) => string) {
    const topic = getTopic(Topics)

    return this.request(topic, 'unsubscribe').then(() => {
      this.streams = this.streams.filter((stream) => {
        return stream !== topic
      })
    })
  }
}
