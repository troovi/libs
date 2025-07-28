import { NetworkManager } from '../../../../connections'
import { areArraysEqual, getRandomIntString } from '../../../../utils'
import { WebsocketBase } from '../../../../websocket'
import { BaseStream } from '../../../../stream-manager'

import { AnyOrangeXPubblicMessage } from './messages'
import { streams } from './subscriptions'
import { EventDispatcher } from '@troovi/utils-js'

interface Response<T> {
  method: 'subscription'
  jsonrpc: '2.0'
  params: T
}

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: Response<AnyOrangeXPubblicMessage>) => void
}

export class OrangeXPublicStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<object>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 110,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://api.orangex.com/ws/api/v1`, {
          service: `orangex:public:${id}`,
          pingInterval: 5000,
          callbacks: {
            onBroken,
            onOpen,
            onPing: () => {
              connection.signal('PING')
            },
            onMessage: (data) => {
              const raw = data.toString()

              if (raw === 'PONG') {
                // connection.logger.log(`Server "pong" captured`, 'STREAM')
                return
              }

              const response = JSON.parse(raw)

              if (response.id !== undefined) {
                if (response.error !== undefined) {
                  connection.logger.error(
                    `Interaction error: ${JSON.stringify(response.error)}`,
                    'STREAM'
                  )
                  this.responses.emit(response.id.toString(), response.result)

                  return
                }

                connection.logger.log(
                  `Interaction message: ${JSON.stringify(response.result)}`,
                  'STREAM'
                )
                this.responses.emit(response.id.toString(), response.result)

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
      subscribe: (connection, channels) => {
        return this.request(connection, channels, '/public/subscribe')
      },
      unsubscribe: (connection, channels) => {
        return this.request(connection, channels, '/public/unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, streams: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      connection.logger.verbose(`${method}: [${id}] ${streams.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (Array.isArray(message) && areArraysEqual(streams, message)) {
          resolve()
        } else {
          connection.logger.error(JSON.stringify(message), method)
          reject()
        }
      })

      connection.send({
        jsonrpc: '2.0',
        id: +id,
        method,
        params: {
          channels: streams
        }
      })
    })
  }
}
