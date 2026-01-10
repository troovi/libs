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

interface Options extends CreateAxiosDefaults {
  handleException?: (e: AxiosError) => void
}

const defaultExceptionHandler = ({ response }: AxiosError) => {
  throw response
}

type ServerSchemeStructure = {
  [context: string]: any
}

// Helper type to validate ServerScheme structure
// Each value should be an IOpattern (routes type like WorkersRoutes, AuthRoutes, etc.)
// type ValidateServerScheme<T> = {
//   [K in keyof T]: T[K] extends IOpattern<any> ? T[K] : never
// }

/* HttpAPI class with typed contexts based on ServerScheme */
export class HttpAPI<ServerScheme extends ServerSchemeStructure> {
  public http: AxiosInstance
  private handleException: (e: AxiosError) => void

  constructor({ handleException = defaultExceptionHandler, ...config }: Options) {
    this.http = axios.create(config)
    this.handleException = handleException
  }

  private async request<T>(props: RequestInterface): Promise<T> {
    const { url, body = {}, method, config = {} } = props
    const dataAtt = method === HttpVerb.Get ? 'params' : 'data'

    return this.http({ url, method, [dataAtt]: body, ...config })
      .then(({ data }) => data)
      .catch(this.handleException)
  }

  /* Creates a typed client for a specific context  */
  useContext<Ctx extends keyof ServerScheme, Routes extends ServerScheme[Ctx]>(context: Ctx & string) {
    const request = this.request.bind(this) as <T>(props: RequestInterface) => Promise<T>

    return {
      post<K extends keyof Routes>(url: K, body: Routes[K]['params'], config?: AxiosRequestConfig) {
        return request<Routes[K]['answer']>({
          method: HttpVerb.Post,
          url: context + '/' + url.toString(),
          config,
          body
        })
      },
      get<K extends keyof Routes>(url: K, body: Routes[K]['params'], config?: AxiosRequestConfig) {
        return request<Routes[K]['answer']>({
          method: HttpVerb.Get,
          url: context + '/' + url.toString(),
          config,
          body
        })
      },
      blob<K extends keyof Routes>(url: K, body: Routes[K]['params']) {
        return this.post(url, body, { responseType: 'arraybuffer' }).then((blobpart) => {
          return new Blob([blobpart as BlobPart])
        })
      }
    }
  }
}

// Example of usage:

// interface AppHttpScheme {
//   app: {
//     data: {
//       params: {}
//       answer: { data: string[] }
//     }
//   }
//   sign: {
//     login: {
//       // params: { email: string }
//       answer: { token: string }
//     }
//   }
// }

// const http = new HttpAPI<AppHttpScheme>({})
// const signApi = http.useContext('sign')

// signApi.get('login', { email: 'email' }).then((x) => {
//   //
// })
