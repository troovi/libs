import protobuf from 'protobufjs'

import { WebsocketBase } from '../../../../websocket'
import { AnyMexcSecureResponse } from './messages'
import { MexcPrivateSubscriptions as Subscriptions } from './subscriptions'
import { resolve } from 'path'
import { areArraysEqual, getRandomIntString } from '../../../../utils'
import { EventDispatcher } from '@troovi/utils-js'

interface Options {
  listenKey: string
  callbacks: {
    onBroken: () => void
    onOpen: () => void
    onMessage: (data: AnyMexcSecureResponse) => void
  }
}

interface ResponseMessage {
  id: number
  code: number
  msg: string
}

export class MexcPrivateStream extends WebsocketBase {
  private proto: protobuf.Type
  private responses = new EventDispatcher<string>()
  private streams: string[] = []

  constructor({ listenKey, callbacks }: Options) {
    super(`wss://wbs-api.mexc.com/ws?listenKey=${listenKey}`, {
      service: 'mexc-private',
      pingInterval: 20000,
      callbacks: {
        ...callbacks,
        onOpen: () => {
          this.initializeProto().then(callbacks.onOpen)
        },
        onPing: () => {
          this.send({ method: 'PING' })
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

            this.responses.emit(response.id.toString(), response.msg)
            this.logger.log(`Interaction message: ${message}`, 'STREAM')
          }
        }
      }
    })
  }

  private async initializeProto() {
    const root = await protobuf.load(resolve(__dirname, '..', '__protos__/PushDataV3ApiWrapper.proto'))
    this.proto = root.lookupType('PushDataV3ApiWrapper')
  }

  subscribe() {
    const streams = [Subscriptions.account(), Subscriptions.deals(), Subscriptions.orders()]

    return this.request(streams, 'SUBSCRIPTION').then(() => {
      this.streams.push(...streams)
    })
  }

  unsubscribe() {
    const streams = [Subscriptions.account(), Subscriptions.deals(), Subscriptions.orders()]

    return this.request(streams, 'UNSUBSCRIPTION').then(() => {
      this.streams = this.streams.filter((stream) => {
        return !streams.includes(stream)
      })
    })
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

  unsubscribeAll() {
    if (this.streams.length > 0) {
      this.request(this.streams, 'UNSUBSCRIPTION').then(() => {
        this.streams = []
      })
    }
  }
}
