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
  private pingInterval: number
  private closeInitiated: boolean = false
  private reconnect: boolean = false

  constructor(private url: string, { pingInterval, callbacks, service }: Options) {
    this.logger = new Logger(service.toUpperCase())
    this.pingInterval = pingInterval
    this.logger.log(`Connecting ...`, 'STREAM')

    this.connect(callbacks)
  }

  private connect({ onOpen, onMessage, onBroken, onPing, onClosed }: Callbacks) {
    const connection = (this.ws = new WebSocketClient(this.url))

    setTimeout(() => {
      if (!this.isConnected()) {
        this.logger.error(`Connection timeout`, 'STREAM')
        this.reconnect = true
        this.ws.terminate()
      }
    }, 10 * 1000)

    const ping = setInterval(() => {
      if (this.isConnected()) {
        onPing()
      } else {
        this.logger.warn('Ping faild', 'PING')
      }
    }, this.pingInterval)

    connection.on('open', () => {
      this.logger.log(`Connection established`, 'STREAM')
      onOpen()
    })

    connection.on('message', (data) => {
      if (!this.closeInitiated) {
        onMessage(data)
      }
    })

    // maintain the connection
    connection.on('ping', () => {
      connection.pong()
    })

    connection.on('error', (err) => {
      this.logger.error(`Error: ${JSON.stringify(err)}`, 'STREAM')

      if (!this.reconnect) {
        onBroken()
      }
    })

    connection.on('unexpected-response', (e) => {
      this.logger.error(`Unexpected response: ${JSON.stringify(e)}`, 'STREAM')
    })

    connection.on('close', (closeEventCode, reason) => {
      clearInterval(ping)

      if (this.reconnect) {
        this.reconnect = false
        this.logger.log('Reconnecting...', 'STREAM')
        this.connect({ onBroken, onMessage, onPing, onOpen, onClosed })
      } else {
        if (this.closeInitiated) {
          this.closeInitiated = false
          this.logger.log(`Connection closed: ${closeEventCode}`, 'STREAM')
          onClosed?.()
        } else {
          this.logger.error(`Connection broken due to ${closeEventCode}: ${reason}`, 'STREAM')
          onBroken()
        }
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
