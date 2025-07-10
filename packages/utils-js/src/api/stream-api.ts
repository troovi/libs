import { hash } from '../random'
import { EventDispatcher } from '../emiters'
import { IOpattern } from './io'

// requests

export type MakeStreamRequests<T extends IOpattern<T>> = {
  [type in keyof T]: {
    id: string
    type: type
    params: T[type]['params']
  }
}[keyof T]

// responses

export type MakeStreamResponses<T extends IOpattern<T>> = {
  [type in keyof T]: {
    id: string
    type: type
    response: { status: 'resolve'; data: T[type]['answer'] } | { status: 'reject'; error: string }
  }
}[keyof T]

// websocket implementation of request-response api

class StreamAPI<T extends IOpattern<T>, Res extends MakeStreamResponses<T> = MakeStreamResponses<T>> {
  private responses = new EventDispatcher<Res>()

  constructor(private send: (data: MakeStreamRequests<T>) => void) {}

  response(message: Res) {
    this.responses.emit(message.id, message)
  }

  request<K extends keyof T, U extends T[K]>(type: K, params: U['params']) {
    return new Promise<U['answer']>((resolve, reject) => {
      const id = hash()

      this.responses.on(id, (message) => {
        if (message.type === type) {
          if (message.response.status === 'resolve') {
            resolve(message.response.data)
            return
          }

          if (message.response.status === 'reject') {
            reject(message.response.error)
          }
        }

        reject()
      })

      this.send({ type, id, params })
    })
  }
}

export { StreamAPI }
