import { AnyBinanceSecureRequest, BinanceSecureResults, BinanceSecureRequests } from './messages'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { sortObject, buildQueryString, getRandomIntString } from '../../../../utils'
import { getHexSignature } from '../../../../crypto'

export type Market = 'spot' | 'futures'

const APIs: Record<string, Record<Market, string>> = {
  mainnet: {
    spot: `wss://ws-api.binance.com:443/ws-api/v3`,
    futures: `wss://ws-fapi.binance.com/ws-fapi/v1`
  },
  testnet: {
    spot: `wss://ws-api.testnet.binance.vision/ws-api/v3`,
    futures: ``
  }
}

interface Options {
  market: Market
  net?: 'main' | 'test'
  apiKey: string
  apiSecret: string
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: BinanceSecureResults.Success | BinanceSecureResults.Faild) => void
  }
}

export class BinancePrivateStream extends WebsocketBase {
  private apiKey: string
  private apiSecret: string

  constructor({ market, net = 'main', apiKey, keepAlive, apiSecret, callbacks }: Options) {
    super(APIs[`${net}net`][market], {
      service: 'binance-private',
      pingInterval: 8000,
      callbacks: {
        ...callbacks,
        onMessage(data) {
          callbacks.onMessage(JSON.parse(data.toString()))
        }
      }
    })

    this.apiSecret = apiSecret
    this.apiKey = apiKey
  }

  private request(data: AnyBinanceSecureRequest) {
    this.send(data)
  }

  pingRequest() {
    this.request({
      id: `PING-${getRandomIntString(10)}`,
      method: 'ping'
    })
  }

  time(ID?: string) {
    this.request({
      id: ID ?? `TIME-${getRandomIntString(10)}`,
      method: 'time'
    })
  }

  order(opt: Omit<BinanceSecureRequests.Order['params'], 'apiKey' | 'newOrderRespType' | 'signature'>) {
    const options: Omit<BinanceSecureRequests.Order['params'], 'signature'> = {
      apiKey: this.apiKey,
      newOrderRespType: 'FULL',
      ...opt
    }

    const signature = this.getSignature(options)

    this.request({
      id: `ORDER-${getRandomIntString(10)}`,
      method: 'order.place',
      params: {
        ...options,
        signature
      }
    })
  }

  // utils

  private getSignature(options: object) {
    return getHexSignature(this.apiSecret, buildQueryString(sortObject(options)))
  }
}
