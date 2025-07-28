import { getRandomIntString } from '../../../../utils'
import { WebsocketBase } from '../../../../websocket'

import { EventDispatcher } from '@troovi/utils-js'
import { KuCoinSpotApi } from '../../api/spot/api'
import { streams } from './subscriptions'
import { AnyKuCoinSpotMessage } from './messages'
import { NetworkManager } from '../../../../connections'
import { BaseStream } from '../../../../stream-manager'

interface Options {
  api: KuCoinSpotApi
  onBroken: (channels: string[]) => void
  onMessage: (data: AnyKuCoinSpotMessage) => void
}

// Max subscription count limitation - 400 per session
export class KuCoinSpotPublicStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<string>()

  constructor({ api, onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: async (id, { onOpen, onBroken }) => {
        const { token, instanceServers } = await api.getWSPublicInfo()

        const server = instanceServers[0]
        const connection = new WebsocketBase(`${server.endpoint}?token=${token}`, {
          service: `kucoin:spot:${id}`,
          pingInterval: server.pingInterval,
          callbacks: {
            onBroken,
            onPing: () => {
              connection.send({ id: +getRandomIntString(8).toString(), type: 'ping' })
            },
            onOpen,
            onMessage: (data) => {
              const raw = data.toString()
              const response = JSON.parse(raw)

              if (response.id) {
                if (response.type === 'pong') {
                  // connection.logger.log(`Recieved "pong" message`, 'STREAM')
                  return
                }

                connection.logger.log(`Interaction message: ${raw}`, 'STREAM')
                this.responses.emit(response.id.toString(), response.type)

                return
              }

              onMessage(response)
            }
          }
        })

        return connection
      }
    })

    super(network, streams, {
      subscribe: (connection, topic) => {
        return this.request(connection, topic, 'subscribe')
      },
      unsubscribe: (connection, topic) => {
        return this.request(connection, topic, 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, topic: string, method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      connection.logger.verbose(`${method}: [${id}] ${topic}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message === 'ack') {
          resolve()
        } else {
          connection.logger.error(message, method)
          reject()
        }
      })

      connection.send({ id: id, type: method, topic, response: true })
    })
  }
}
