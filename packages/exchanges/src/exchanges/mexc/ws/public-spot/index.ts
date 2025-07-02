import protobuf from 'protobufjs'

import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { AnyMexcMessage } from './messages'
import { MexcPublicSubscriptions as Subscriptions } from './subscriptions'
import { resolve } from 'path'
import { areArraysEqual, getRandomIntString, toArray } from '../../../../utils'
import { EventDispatcher, splitByChunks } from '@troovi/utils-js'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: AnyMexcMessage) => void
  }
}

interface ResponseMessage {
  id: number
  code: number
  msg: string
}

// One ws connection supports a maximum of 30 subscriptions.

export class MexcSpotPublicStream extends WebsocketBase {
  private proto: protobuf.Type
  private responses = new EventDispatcher<string>()
  private streams: string[] = []

  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://wbs-api.mexc.com/ws`, {
      service: 'mexc-public',
      keepAlive,
      callbacks: {
        ...callbacks,
        onOpen: () => {
          this.initializeProto().then(callbacks.onOpen)

          // Maintain the connection
          setInterval(() => {
            if (this.isConnected()) {
              this.send({ method: 'PING' })
            }
          }, 25000)
        },
        onMessage: (data) => {
          try {
            const message = this.proto.decode(data as Buffer)
            const object: any = this.proto.toObject(message, {
              longs: String,
              enums: String,
              bytes: String
            })

            callbacks.onMessage(object)
          } catch (err) {
            const message = data.toString()
            const response: ResponseMessage = JSON.parse(message)

            if (response.msg === 'PONG' || response.msg === 'PING') {
              return
            }

            this.logger.log(`Interaction message: ${message}`, 'STREAM')
            this.responses.emit(response.id.toString(), response.msg)
          }
        }
      }
    })
  }

  private async initializeProto() {
    const root = await protobuf.load(resolve(__dirname, '..', '__protos__/PushDataV3ApiWrapper.proto'))
    this.proto = root.lookupType('PushDataV3ApiWrapper')
  }

  private request(streams: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      this.logger.verbose(`${method}: [${id}] ${streams.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (areArraysEqual(streams, message.split(','))) {
          resolve()
        } else {
          this.logger.error(message, method)
          reject()
        }
      })

      this.send({
        id: +id,
        method,
        params: streams
      })
    })
  }

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, 'SUBSCRIPTION').then(() => {
      this.streams.push(...streams)
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, 'UNSUBSCRIPTION').then(() => {
      this.streams = this.streams.filter((stream) => {
        return !streams.includes(stream)
      })
    })
  }

  async unsubscribeAll() {
    const subscriptions = splitByChunks(this.streams, 4)

    for await (const streams of subscriptions) {
      await this.request(streams, 'UNSUBSCRIPTION')
    }

    this.streams = []
  }
}
