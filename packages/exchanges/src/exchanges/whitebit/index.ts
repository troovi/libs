import { WebSocketCallbacks, WebsocketBase } from '../../websocket'
import { getRandomIntString } from '../../utils'
import { WhiteBitMessages } from './messages'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: WhiteBitMessages.depthUpdate) => void
  }
}

export class WhiteBitPublicStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://api.whitebit.com/ws`, {
      service: 'whitebit',
      pingInterval: 5000,
      callbacks: {
        ...callbacks,
        onMessage: (data) => {
          const response = JSON.parse(data.toString())

          if (response.error) {
            this.logger.error(`Error message: ${JSON.stringify(response)}`, 'data')
            callbacks.onBroken?.()
            return
          }

          if (response.result !== undefined) {
            this.logger.log(
              `Interaction message [${response.id}]:  ${JSON.stringify(response.result)}`,
              'data'
            )

            return
          }

          callbacks.onMessage(response)
        }
      }
    })

    // Maintain the connection
    setInterval(() => {
      if (this.isConnected()) {
        this.send({ id: 0, method: 'ping', params: [] })
      }
    }, 50000)
  }

  subscribeOrderBook(symbol: string) {
    const id = +getRandomIntString(2)

    this.logger.verbose(`Subscribe '${symbol}' orderbook: [${id}]`, 'STREAM')
    this.send({
      id,
      method: 'depth_subscribe',
      params: [
        symbol, // market
        100, // limit. available values - 1, 5, 10, 20, 30, 50, 100
        '0', // price interval units. "0" - no interval, available values - "0.00000001", "0.0000001", "0.000001", "0.00001", "0.0001", "0.001", "0.01", "0.1"
        true // multiple subscription flag. true - add, false - unsubscribe from all
      ]
    })
  }

  subscribeTrades(symbols: string[]) {
    const id = +getRandomIntString(2)

    this.logger.verbose(`Subscribe trades [${id}]: ${symbols.join(', ')}`, 'STREAM')
    this.send({
      id,
      method: 'trades_subscribe',
      params: symbols
    })
  }

  unsubscribeTrades() {
    const id = +getRandomIntString(2)

    this.send({
      id,
      method: 'trades_unsubscribe',
      params: []
    })
  }

  unsubscribeOrderBook() {
    const id = +getRandomIntString(2)

    this.logger.verbose(`Unsubscribe orderbooks: [${id}]`, 'STREAM')
    this.send({
      id,
      method: 'depth_unsubscribe',
      params: []
    })
  }
}
