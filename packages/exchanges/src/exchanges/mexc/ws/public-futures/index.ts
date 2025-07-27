import { sleep } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'
import { WebsocketBase } from '../../../../websocket'
import { MexcFuturesMessages } from './messages'
import { streams } from './subscriptions'

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: MexcFuturesMessages.Depth) => void
}

export class MexcFuturesPublicStream extends BaseStream<typeof streams> {
  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://contract.mexc.com/edge`, {
          service: `mexc:futures:${id}`,
          pingInterval: 5000,
          callbacks: {
            onBroken,
            onOpen,
            onPing: () => {
              connection.send({ method: 'ping' })
            },
            onMessage: (data) => {
              const message = JSON.parse(data.toString())

              if (message.channel) {
                if ((message.channel as string).startsWith('rs.')) {
                  connection.logger.log(`Interaction message: ${JSON.stringify(message)}`, 'STREAM')
                  return
                }

                if (message.channel === 'pong') {
                  // connection.logger.log(`Recieved "pong" message`, 'STREAM')
                  return
                }
              }

              onMessage(message)
            }
          }
        })

        return connection
      }
    })

    super(network, streams, {
      subscribe: (connection, { method, param }) => {
        return this.request(connection, { method: `sub.${method}`, param })
      },
      unsubscribe: (connection, { method, param }) => {
        return this.request(connection, { method: `unsub.${method}`, param })
      }
    })
  }

  private request(connection: WebsocketBase, data: Record<string, unknown>) {
    return new Promise<void>((resolve) => {
      connection.logger.verbose(`${data.method}: ${JSON.stringify(data.param)}`, 'STREAM')

      sleep(250).then(() => {
        resolve()
      })

      connection.send(data)
    })
  }
}
