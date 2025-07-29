import { streams } from './subscriptions'
import { NetworkManager } from '../../../connections'
import { getRandomIntString } from '../../../utils'
import { WebsocketBase } from '../../../websocket'

import { CoinExMessages } from './messages'
import { EventDispatcher } from '@troovi/utils-js'
import { gunzip } from 'zlib'
import { BaseStream } from '../../../stream-manager'

const APIs = {
  spot: `wss://socket.coinex.com/v2/spot`,
  futures: `wss://socket.coinex.com/v2/futures`
}

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: CoinExMessages.Depth | CoinExMessages.State) => void
}

export class CoinExStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<string>()

  constructor(market: 'spot' | 'futures', { onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(APIs[market], {
          service: `coinex:${market}:${id}`,
          pingInterval: 5000,
          callbacks: {
            onBroken,
            onPing: () => {
              connection.send({ method: 'server.ping', id: +getRandomIntString(8), params: {} })
            },
            onOpen,
            onMessage: (data) => {
              gunzip(data as Buffer, (err, result) => {
                if (err) {
                  throw err
                }

                const raw = result.toString()
                const response = JSON.parse(raw)

                if (response.id) {
                  if (response?.data?.result === 'pong') {
                    return
                  }

                  connection.logger.log(`Interaction message: ${raw}`, 'STREAM')
                  this.responses.emit(response.id.toString(), response.message)

                  return
                }

                onMessage(response)
              })
            }
          }
        })

        return connection
      }
    })

    super(network, streams, {
      subscribe: (connection, { method, markets }) => {
        return this.request(connection, `${method}.subscribe`, markets)
      },
      unsubscribe: (connection, { method, markets }) => {
        const value = (() => {
          if (method === 'depth') {
            return markets.map((item) => item[0])
          }

          return markets
        })()

        return this.request(connection, `${method}.unsubscribe`, value)
      }
    })
  }

  private request(connection: WebsocketBase, method: string, markets: unknown[]) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()
      const list = markets.map((market) => {
        return Array.isArray(market) ? market[0] : market
      })

      connection.logger.verbose(`${method}: [${id}] (${markets.length}) ${list.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message === 'OK') {
          resolve()
        } else {
          connection.logger.error(message, method)
          reject()
        }
      })

      connection.send({
        id: +id,
        method,
        params: {
          market_list: markets
        }
      })
    })
  }
}
