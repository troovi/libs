import { BaseStream, NetworkManager } from '../../../../connections'
import { getRandomIntString } from '../../../../utils'
import { WebsocketBase } from '../../../../websocket'

import { AnyBinanceMessage } from './messages'
import { EventDispatcher } from '@troovi/utils-js'
import { streams } from './subscriptions'

type Market = 'spot' | 'futures'

const APIs: Record<Market, string> = {
  spot: `wss://stream.binance.com:9443/ws`,
  futures: `wss://fstream.binance.com/ws`
}

interface Options<M extends Market> {
  onBroken: (channels: string[]) => void
  onMessage: (data: AnyBinanceMessage<M>, rawMsg: string) => void
}

// A single connection can listen to a maximum of 1024 streams.
// There is a limit of 300 connections per attempt every 5 minutes per IP.

export class BinancePublicStream<M extends Market> extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<null>()

  constructor(market: M, { onMessage, onBroken }: Options<M>) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(APIs[market], {
          service: `binance:${market}:${id}`,
          callbacks: {
            onOpen,
            onBroken,
            onMessage: (data) => {
              const raw = data.toString()
              const response = JSON.parse(raw)

              if (response.code !== undefined || response.error !== undefined) {
                connection.logger.error(`Error message: ${JSON.stringify(response)}`, 'STREAM')
                onBroken?.()
                return
              }

              if (response.result !== undefined) {
                connection.logger.log(`Interaction message: ${raw}`, 'STREAM')
                this.responses.emit(response.id.toString(), response.result)

                return
              }

              onMessage(response, raw)
            }
          }
        })

        return connection
      }
    })

    super(network, streams, {
      subscribe: (connection, subscriptions) => {
        return this.request(connection, subscriptions, 'SUBSCRIBE')
      },
      unsubscribe: (connection, subscriptions) => {
        return this.request(connection, subscriptions, 'UNSUBSCRIBE')
      }
    })
  }

  private request(connection: WebsocketBase, channels: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      connection.logger.verbose(`${method}: [${id}] ${channels.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message === null) {
          resolve()
        } else {
          connection.logger.error(message, method)
          reject()
        }
      })

      connection.send({ id: +id, method, params: channels })
    })
  }
}
