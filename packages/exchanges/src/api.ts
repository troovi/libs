import * as https from 'node:https'

import { Logger } from '@troovi/utils-nodejs'
import { sleep } from '@troovi/utils-js'

import axios, {
  AxiosInstance,
  CreateAxiosDefaults,
  AxiosRequestConfig,
  AxiosError,
  Method
} from 'axios'
import dns from 'dns'
import { promisify } from 'util'
import { LookupFunction } from 'node:net'

const lookup = promisify(dns.lookup)

// Пример с кастомным DNS lookup'ом
const customLookup: LookupFunction = (hostname, options) => {
  return lookup(hostname, { all: false, verbatim: false })
}

export type AuthStrategy = (method: Method, url: string, options: object) => AxiosRequestConfig<any>

interface Options {
  name: string
  headers?: CreateAxiosDefaults['headers']
  catchHeaders?: (headers: CreateAxiosDefaults['headers']) => void
  authStrategy: AuthStrategy
}

export const dataAtt = (method: Method) => (method === 'GET' ? 'params' : 'data')

export type IOpattern<T extends IOpattern<T>> = {
  [key in keyof T]: {
    params: T[key]['params']
    answer: T[key]['answer']
  }
}

export class ApiClient<APIs extends IOpattern<APIs>> {
  private authStrategy: AuthStrategy

  private api: AxiosInstance
  public logger: Logger
  private catchHeaders: (headers: CreateAxiosDefaults['headers']) => void

  constructor(baseURL: string, options: Options) {
    const { name, authStrategy, catchHeaders, headers } = options

    this.authStrategy = authStrategy
    this.api = axios.create({
      baseURL,
      headers,
      timeout: 10 * 1000,
      httpsAgent: new https.Agent({
        keepAlive: true
        // lookup: customLookup
      })
    })
    this.logger = new Logger(`${name.toUpperCase()}-API`)
    this.catchHeaders = catchHeaders ?? (() => {})
  }

  // prettier-ignore
  apiRequest<U extends keyof APIs, T extends APIs[U]>(method: Method, url: U, params: T['params']) {
    return this.request<T['answer']>({ url: url as string, method, [dataAtt(method)]: params })
  }

  signRequest<T>(method: Method, url: string, options: object) {
    return this.request<T>(this.authStrategy(method, url, options))
  }

  request<T>(config: AxiosRequestConfig<any>): Promise<T> {
    this.logger.log(`Request: "${config.url}"`, `${config.method}`)

    return this.api
      .request<T>(config)
      .then(({ data, headers }) => {
        this.catchHeaders(headers)
        return data
      })
      .catch(createAxiosErrorHandler(() => this.request(config)))
  }
}

export const createAxiosErrorHandler = <T>(callback: () => Promise<T>) => {
  return async (e: AxiosError) => {
    if (e.code === 'ENOTFOUND') {
      console.log('ENOTFOUND error, retry...', e.request._currentUrl)
      await sleep(2500)
      return callback()
    }

    if (e.code === 'ECONNRESET') {
      console.log('ECONNRESET error, retry...', e.request._currentUrl)
      await sleep(5000)
      return callback()
    }

    if (e.code === 'ETIMEDOUT') {
      console.log('ETIMEDOUT error, retry...', e.request._currentUrl)
      await sleep(2500)
      return callback()
    }

    if (e.code === 'ECONNABORTED') {
      console.log('ECONNABORTED error, retry...', e.request._currentUrl)
      await sleep(3000)
      return callback()
    }

    console.log(e)
    throw e
  }
}
