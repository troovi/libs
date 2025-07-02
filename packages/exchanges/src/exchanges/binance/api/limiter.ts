import { AxiosError } from 'axios'
import { QueueManager, sleep } from '@troovi/utils-js'
import { HeadersLimiter, Logger } from '@troovi/utils-nodejs'

export class BinanceLimiter {
  private queue = new QueueManager()
  private logger = new Logger('BINANCE-LIMITER')

  public headersControll = new HeadersLimiter({
    'x-mbx-used-weight': 0,
    'x-mbx-used-weight-1m': 0,
    'x-sapi-used-ip-weight-1m': 0,
    'x-mbx-order-count-1s': 0,
    'x-mbx-order-count-1m': 0,
    'x-mbx-order-count-1h': 0,
    'x-mbx-order-count-1d': 0
  })

  request<T>(request: () => Promise<T>): Promise<T> {
    const limits = this.headersControll.getRateLimitStates()

    this.logger.log(
      `Sending request... (used weight: ${limits['x-mbx-used-weight']}/${limits['x-mbx-used-weight-1m']})`,
      'LIMITS'
    )

    return request().catch(async ({ response }: AxiosError<{ code?: number }>) => {
      if (response?.data?.code === -1003) {
        this.logger.warn('Too much request weight used. Got banned', 'LIMITS')

        if (response.headers) {
          const headerValue = response.headers['retry-after']
          const retryAfter = parseInt(headerValue)

          if (headerValue !== undefined && !isNaN(retryAfter)) {
            const latency = retryAfter * 1000

            this.logger.verbose(`Retry after: ${latency}sec`, 'LIMITS')
            await sleep(latency)

            return this.request(request)
          }
        }

        this.logger.warn(`Retry-After header not provided. Making minute latency`, 'LIMITS')
        await sleep(60 * 1000)
      } else {
        throw response
      }

      return this.request(request)
    })
  }

  limiter<T>(request: () => Promise<T>): Promise<T> {
    return this.queue.add(() => this.request(request))
  }
}
