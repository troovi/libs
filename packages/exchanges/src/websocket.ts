import { Logger } from '@troovi/utils-nodejs'
import WebSocketClient from 'ws'

export interface WebSocketCallbacks {
  onPing: () => void
  onOpen: () => void
  onBroken: () => void
  onClosed?: () => void
}

interface Callbacks extends WebSocketCallbacks {
  onMessage: (data: WebSocketClient.RawData) => void
}

interface Options {
  service: string
  pingInterval: number
  callbacks: Callbacks
}

export class WebsocketBase {
  public logger: Logger

  private ws: WebSocketClient
  private closeInitiated: boolean = false

  constructor(private url: string, { pingInterval, callbacks, service }: Options) {
    this.logger = new Logger(service.toUpperCase())

    this.logger.log(`Connecting ...`, 'STREAM')

    const connection = (this.ws = new WebSocketClient(this.url))

    const timeout = setTimeout(() => {
      this.logger.error(`Connection timeout`, 'STREAM')
      this.ws.terminate()
    }, 10 * 1000)

    const ping = setInterval(() => {
      if (this.isConnected()) {
        callbacks.onPing()
      } else {
        this.logger.warn('Ping faild', 'PING')
      }
    }, pingInterval)

    connection.on('open', () => {
      clearTimeout(timeout)

      this.logger.log(`Connection established`, 'STREAM')
      callbacks.onOpen()
    })

    // handle data message. Pass the data to the call back method from user
    // It could be useful to store the original messages from server for debug
    connection.on('message', (data) => {
      if (!this.closeInitiated) {
        callbacks.onMessage(data)
      }
    })

    // maintain the connection
    connection.on('ping', () => {
      connection.pong()
    })

    connection.on('error', (err) => {
      clearTimeout(timeout)

      this.logger.error(`Received ERROR from server: ${JSON.stringify(err)}`, 'STREAM')
      callbacks.onBroken?.()
    })

    connection.on('unexpected-response', (e) => {
      this.logger.error(JSON.stringify(e), 'unexpected response')
    })

    connection.on('close', (closeEventCode, reason) => {
      clearTimeout(timeout)
      clearInterval(ping)

      if (this.closeInitiated) {
        this.closeInitiated = false
        this.logger.log(`Connection closed: ${closeEventCode}`, 'STREAM')
        callbacks.onClosed?.()
      } else {
        this.logger.error(`Connection broken due to ${closeEventCode}: ${reason}`, 'STREAM')
        callbacks.onBroken?.()
      }
    })
  }

  isConnected() {
    return this.ws.readyState === WebSocketClient.OPEN
  }

  disconnect() {
    if (this.isConnected()) {
      this.closeInitiated = true
      this.ws.close()
      this.logger.log(`Closing connection to the server`, 'STREAM')
    }
  }

  ping() {
    this.ws.ping()
  }

  send(payload: object) {
    if (this.isConnected()) {
      this.ws.send(JSON.stringify(payload))
    } else {
      this.logger.warn('Connection not opened', 'STREAM')
    }
  }

  signal(payload: string) {
    if (this.isConnected()) {
      this.ws.send(payload)
    } else {
      this.logger.warn('Connection not opened', 'STREAM')
    }
  }
}
