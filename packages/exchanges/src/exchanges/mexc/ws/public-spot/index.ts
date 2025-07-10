import protobuf from 'protobufjs'

import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { AnyMexcMessage } from './messages'
import { subscriptions } from './subscriptions'
import { resolve } from 'path'
import { areArraysEqual, getRandomIntString, toArray } from '../../../../utils'
import { EventDispatcher, splitByChunks } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'

interface Options {
  onBroken?: (channels: string[]) => void
  onMessage: (data: AnyMexcMessage) => void
}

interface ResponseMessage {
  id: number
  code: number
  msg: string
}

// One ws connection supports a maximum of 30 subscriptions.

export class MexcSpotPublicStream extends BaseStream<typeof subscriptions> {
  private proto: protobuf.Type
  private responses = new EventDispatcher<string>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 30,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://wbs-api.mexc.com/ws`, {
          service: `mexc:public:${id}`,
          callbacks: {
            onBroken,
            onOpen: () => {
              // Maintain the connection
              setInterval(() => {
                if (connection.isConnected()) {
                  connection.send({ method: 'PING' })
                }
              }, 25000)

              this.initializeProto().then(onOpen)
            },
            onMessage: (data) => {
              try {
                const message = this.proto.decode(data as Buffer)
                const object: any = this.proto.toObject(message, {
                  longs: String,
                  enums: String,
                  bytes: String
                })

                onMessage(object)
              } catch (err) {
                const message = data.toString()
                const response: ResponseMessage = JSON.parse(message)

                if (response.msg === 'PONG' || response.msg === 'PING') {
                  return
                }

                connection.logger.log(`Interaction message: ${message}`, 'STREAM')
                this.responses.emit(response.id.toString(), response.msg)
              }
            }
          }
        })

        return connection
      }
    })

    super(network, subscriptions, {
      subscribe: (connection, channels) => {
        return this.request(connection, channels, 'SUBSCRIPTION')
      },
      unsubscribe: (connection, channels) => {
        return this.request(connection, channels, 'UNSUBSCRIPTION')
      }
    })
  }

  private async initializeProto() {
    const root = await protobuf.load(resolve(__dirname, '..', '__protos__/PushDataV3ApiWrapper.proto'))
    this.proto = root.lookupType('PushDataV3ApiWrapper')
  }

  private request(connection: WebsocketBase, streams: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      connection.logger.verbose(`${method}: [${id}] ${streams.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (areArraysEqual(streams, message.split(','))) {
          resolve()
        } else {
          connection.logger.error(message, method)
          reject()
        }
      })

      connection.send({
        id: +id,
        method,
        params: streams
      })
    })
  }
}
