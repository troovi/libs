import { Logger } from '@troovi/utils-nodejs'
import WebSocketClient from 'ws'

export interface WebSocketCallbacks {
  onOpen: () => void
  onBroken: () => void
  onClosed?: () => void
}

interface Callbacks extends WebSocketCallbacks {
  onMessage: (data: WebSocketClient.RawData) => void
}

interface Options {
  service: string
  keepAlive?: boolean
  callbacks: Callbacks
}

export class WebsocketBase {
  public closeInitiated: boolean = false
  public logger: Logger

  private callbacks: Callbacks
  private ws: WebSocketClient
  private isBroken = false
  private keepAlive = false

  private onPong: () => void

  constructor(private url: string, { keepAlive, callbacks, service }: Options) {
    this.callbacks = callbacks
    this.keepAlive = keepAlive ?? false

    this.logger = new Logger(service.toUpperCase())

    this.connect()
  }

  connect() {
    const connection = new WebSocketClient(this.url)

    const timeout = setTimeout(() => {
      this.logger.error(`Connection timeout`, 'STREAM')
      this.ws.terminate()
    }, 10 * 1000)

    this.logger.log(`Connecting ...`, 'STREAM')

    this.ws = connection
    this.closeInitiated = false
    this.isBroken = false

    connection.on('open', () => {
      clearTimeout(timeout)

      this.logger.log(`Connection established`, 'STREAM')
      this.callbacks.onOpen()
    })

    // handle data message. Pass the data to the call back method from user
    // It could be useful to store the original messages from server for debug
    connection.on('message', (data) => {
      if (!this.closeInitiated) {
        this.callbacks.onMessage(data)
      }
    })

    connection.on('ping', () => {
      connection.pong()
    })

    connection.on('pong', () => {
      this.onPong()
    })

    connection.on('error', (err) => {
      clearTimeout(timeout)

      this.logger.error(`Received ERROR from server: ${JSON.stringify(err)}`, 'STREAM')
      this.callbacks.onBroken?.()
      this.isBroken = true

      if (this.keepAlive) {
        this.disconnect()
      }
    })

    connection.on('close', (closeEventCode, reason) => {
      clearTimeout(timeout)

      if (this.closeInitiated) {
        this.closeInitiated = false
        this.logger.log(`Connection closed: ${closeEventCode}`, 'STREAM')
        this.callbacks.onClosed?.()

        if (this.isBroken && this.keepAlive) {
          this.connect()
        }
      } else {
        this.logger.error(`Connection broken due to ${closeEventCode}: ${reason}`, 'STREAM')
        this.callbacks.onBroken?.()
        this.isBroken = true

        if (this.keepAlive) {
          this.connect()
        }
      }
    })
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocketClient.OPEN
  }

  disconnect() {
    if (this.isConnected()) {
      this.closeInitiated = true

      this.ws.close()
      this.logger.log(`Closing connection to the server`, 'STREAM')
    }
  }

  ping() {
    const startTime = Date.now()

    return new Promise<number>((resolve) => {
      this.onPong = () => {
        resolve(Date.now() - startTime)
      }

      this.ws.ping()
    })
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
