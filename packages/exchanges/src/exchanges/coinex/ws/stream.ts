import { subscriptions } from './subscriptions'
import { BaseStream, NetworkManager } from '../../../connections'
import { getRandomIntString } from '../../../utils'
import { WebsocketBase } from '../../../websocket'

import { CoinExMessages } from './messages'
import { EventDispatcher } from '@troovi/utils-js'
import { gunzip } from 'zlib'

const APIs = {
  spot: `wss://socket.coinex.com/v2/spot`,
  futures: `wss://socket.coinex.com/v2/futures`
}

interface Options {
  onBroken?: (channels: string[]) => void
  onMessage: (data: CoinExMessages.Depth) => void
}

export class CoinExStream extends BaseStream<typeof subscriptions> {
  private responses = new EventDispatcher<string>()

  constructor(market: 'spot' | 'futures', { onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(APIs[market], {
          service: `coinex:${market}:${id}`,
          callbacks: {
            onBroken,
            onOpen: () => {
              // Maintain the connection
              setInterval(() => {
                if (connection.isConnected()) {
                  connection.send({ method: 'server.ping', id: +getRandomIntString(8), params: {} })
                }
              }, 15000)

              onOpen()
            },
            onMessage: (data) => {
              gunzip(data as Buffer, (err, result) => {
                if (err) {
                  throw err
                }

                const raw = result.toString()
                const response = JSON.parse(raw)

                if (response.id) {
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

    super(network, subscriptions, {
      subscribe: (connection, channels) => {
        const method = channels[0].split(':')[0]
        const markets = channels.map((stream) => {
          const name = stream.split(':')[1]

          if (method === 'depth') {
            return JSON.parse(name)
          }
        })

        return this.request(connection, `${method}.subscribe`, markets)
      },
      unsubscribe: (connection, channels) => {
        const method = channels[0].split(':')[0]
        const markets = channels.map((stream) => {
          const name = stream.split(':')[1]

          if (method === 'depth') {
            return JSON.parse(name)[0]
          }
        })

        return this.request(connection, `${method}.unsubscribe`, markets)
      }
    })
  }

  private request(connection: WebsocketBase, method: string, markets: object[]) {
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
