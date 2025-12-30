import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios'

export type IOpattern<T extends IOpattern<T>> = {
  [key in keyof T]: {
    params: T[key]['params']
    answer: T[key]['answer']
  }
}

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

export class HttpAPI {
  public http: AxiosInstance

  constructor(config: CreateAxiosDefaults) {
    this.http = axios.create(config)
  }

  private async request<T>(props: RequestInterface): Promise<T> {
    const { url, body = {}, method, config = {} } = props
    const dataAtt = method === HttpVerb.Get ? 'params' : 'data'

    return this.http({ url, method, [dataAtt]: body, ...config })
      .then(({ data }) => data)
      .catch(({ response }: AxiosError) => {
        throw response
      })
  }

  createClient<T extends IOpattern<T>>(context: string = '') {
    const request = this.request.bind(this) as <T>(props: RequestInterface) => Promise<T>

    if (context) {
      context += '/'
    }

    return {
      post<K extends keyof T>(url: K, body: T[K]['params'], config?: AxiosRequestConfig) {
        return request<T[K]['answer']>({
          method: HttpVerb.Post,
          url: context + url.toString(),
          config,
          body
        })
      },
      get<K extends keyof T>(url: K, body: T[K]['params'], config?: AxiosRequestConfig) {
        return request<T[K]['answer']>({
          method: HttpVerb.Get,
          url: context + url.toString(),
          config,
          body
        })
      },
      blob<K extends keyof T>(url: K, body: T[K]['params']) {
        return this.post(url, body, { responseType: 'arraybuffer' }).then((blobpart) => {
          return new Blob([blobpart as BlobPart])
        })
      }
    }
  }
}
