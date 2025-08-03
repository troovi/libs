import type { IOpattern } from './io'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

enum HttpVerb {
  Get = 'GET',
  Post = 'POST'
}

interface RequestInterface {
  url: string
  body?: any
  config?: AxiosRequestConfig
  method: HttpVerb
}

export class HttpAPI<T extends IOpattern<T>> {
  public http: AxiosInstance

  constructor(server: string) {
    this.http = axios.create({
      baseURL: server
    })
  }

  private async request<T>(props: RequestInterface): Promise<T> {
    const { url, body = {}, method, config = {} } = props
    const dataAtt = method === HttpVerb.Get ? 'params' : 'data'

    return this.http({ url, method, [dataAtt]: body, ...config }).then(({ data }) => data)
  }

  post<K extends keyof T>(url: K, body: T[K]['params'], config?: AxiosRequestConfig) {
    return this.request<T[K]['answer']>({ method: HttpVerb.Post, url: url as string, config, body })
  }

  get<K extends keyof T>(url: K, body: T[K]['params'], config?: AxiosRequestConfig) {
    return this.request<T[K]['answer']>({ method: HttpVerb.Get, url: url as string, config, body })
  }
}
