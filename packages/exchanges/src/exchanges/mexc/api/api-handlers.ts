import { AxiosError } from 'axios'

export const MexcHandlers = {
  handleRecvError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: number }>) => {
      if (e?.response?.data?.code === 700003) {
        console.log('recvWindow error, retry...')
        return this.handleRecvError(request)
      }

      throw e
    })
  },
  handleErrorMessage(callback: (message: string) => void) {
    return ({ response }: AxiosError) => {
      callback((response?.data as { msg?: string })?.msg ?? 'Unknown error')
    }
  },
  infitityTry<T>(api: () => Promise<T>): Promise<T> {
    return api().catch((e: AxiosError) => {
      console.log(`infitityTry: error`)
      return this.infitityTry(api)
    })
  }
}
