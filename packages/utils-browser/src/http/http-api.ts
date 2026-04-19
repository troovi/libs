import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios'
import { AnyFileInput, FileInput, IOFLpattern, IOFpattern, IOpattern } from '@companix/xeo-types'

interface RequestInterface {
  url: string
  body?: any
  config?: AxiosRequestConfig
  method: 'POST' | 'GET'
}

interface Options extends CreateAxiosDefaults {
  handleException?: (e: AxiosError) => void
}

const defaultExceptionHandler = ({ response }: AxiosError) => {
  throw response
}

type ServerSchemeStructure = {
  [context: string]: any // IOpattern
}

export class HttpAPI {
  public http: AxiosInstance
  private handleException: (e: AxiosError) => void

  constructor({ handleException = defaultExceptionHandler, ...config }: Options = {}) {
    this.http = axios.create(config)
    this.handleException = handleException
  }

  async request<T>(props: RequestInterface): Promise<T> {
    const { url, body = {}, method, config = {} } = props
    const dataAtt = method === 'GET' ? 'params' : 'data'

    return this.http({ url, method, [dataAtt]: body, ...config })
      .then(({ data }) => data)
      .catch(this.handleException)
  }

  /* Creates a typed client for a specific context  */

  createIORoutesScheme<ServerScheme extends ServerSchemeStructure>() {
    return <Ctx extends keyof ServerScheme>(context: Ctx & string) => {
      return this.useRoutes<ServerScheme[Ctx]>(context)
    }
  }

  // prettier-ignore
  useIOFRoutes<Routes extends IOFpattern<Routes>>(context: string) {
    return <K extends keyof Routes>(url: K, files: FileParam<Routes[K]['files']>, body: Routes[K]['params'], config?: AxiosRequestConfig) => {
      return this.request<Routes[K]['answer']>({
        method: 'POST',
        url: context + '/' + url.toString(),
        config: { headers: { 'Content-Type': 'multipart/form-data; charset=utf-8' }, ...config },
        body: transport(files, body as object)
      })
    }
  }

  // prettier-ignore
  useIOFLRoutes<Routes extends IOFLpattern<Routes>>(context: string) {
    return <K extends keyof Routes>(url: K, files: FileParam<Routes[K]['files']>, config?: AxiosRequestConfig) => {
      return this.request<Routes[K]['answer']>({
        method: 'POST',
        url: context + '/' + url.toString(),
        config: { headers: { 'Content-Type': 'multipart/form-data; charset=utf-8' }, ...config },
        body: transport(files)
      })
    }
  }

  private useRoutes<Routes extends IOpattern<Routes>>(context: string) {
    const request = this.request.bind(this) as <T>(props: RequestInterface) => Promise<T>

    return {
      post<K extends keyof Routes>(url: K, body: Routes[K]['params'], config?: AxiosRequestConfig) {
        return request<Routes[K]['answer']>({
          method: 'POST',
          url: context + '/' + url.toString(),
          config,
          body
        })
      },
      get<K extends keyof Routes>(url: K, body: Routes[K]['params']) {
        return request<Routes[K]['answer']>({
          method: 'GET',
          url: context + '/' + url.toString(),
          body
        })
      },
      // will be removed in future
      blob<K extends keyof Routes>(url: K, body: Routes[K]['params']) {
        return this.post(url, body, { responseType: 'arraybuffer' }).then((blobpart) => {
          return new Blob([blobpart as BlobPart])
        })
      }
    }
  }
}

const transport = (files: Record<string, Blob | Blob[]>, params: object = {}) => {
  const data = new FormData()

  for (const name in files) {
    const value = files[name]

    if (Array.isArray(value)) {
      value.forEach((file) => {
        data.append(name, file)
      })
    } else {
      data.append(name, value)
    }
  }

  for (const key in params) {
    data.append(key, String(params[key as keyof object]))
  }

  return data
}

type FileParam<T extends AnyFileInput> = T extends FileInput.Single<infer N>
  ? { [K in N & string]: Blob }
  : T extends FileInput.Set<infer N>
  ? { [K in N & string]: Blob[] }
  : T extends FileInput.Map<infer N>
  ? { [K in N & string]: [Blob] }
  : never
