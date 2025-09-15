import { Logger } from './logger'
import { generateCode, sleep } from '@troovi/utils-js'

interface LimiterOptions {
  name: string
  limit: number
  interval: number
  threshold?: number
}

// todo: disable parralels
export class FrequencyLimiter {
  private readonly logger: Logger

  private readonly limit: number
  private readonly interval: number

  private resetTimestamp: number = Date.now()
  private usedWeight: number = 0
  private resolvedWeight: number = 0
  private threshold: number

  private tasks = new Set<string>()

  constructor({ interval, threshold, name, limit }: LimiterOptions) {
    this.interval = interval
    this.limit = limit
    this.threshold = threshold ?? 1500
    this.logger = new Logger(`LIMITTER${name ? `-${name.toUpperCase()}` : ''}`)
  }

  async wrap<T>(weight: number, request: () => Promise<T>, id: string = generateCode(8)): Promise<T> {
    this.tasks.add(id)

    if (Date.now() > this.resetTimestamp) {
      if (this.usedWeight >= this.limit) {
        if (this.resolvedWeight !== this.usedWeight) {
          this.logger.warn(
            `WAIT (${this.resolvedWeight}/${this.usedWeight}). [${this.tasks.size}]`,
            'NOT RESOLVED'
          )

          await sleep(1500)
          return this.wrap(weight, request, id)
        }
      }

      this.resetTimestamp = Date.now() + this.interval
      this.usedWeight = 0
      this.resolvedWeight = 0
    }

    if (this.usedWeight + weight <= this.limit) {
      this.usedWeight += weight

      return request().finally(() => {
        this.tasks.delete(id)
        this.resolvedWeight += weight
      })
    }

    const wait = this.resetTimestamp - Date.now() + this.threshold

    this.logger.warn(`WAIT: ${wait}. [${this.tasks.size}]`, 'VIOLATION')
    await sleep(wait)

    return this.wrap(weight, request, id)
  }
}

export class HeadersLimiter {
  public apiLimitTrackers: Record<string, number>
  public apiLimitLastUpdated: number

  constructor(headers: Record<string, any>) {
    this.apiLimitTrackers = headers
  }

  getRateLimitStates(): Record<string, number> {
    return {
      ...this.apiLimitTrackers,
      lastUpdated: this.apiLimitLastUpdated
    }
  }

  updateApiLimitState(responseHeaders: Record<string, any>) {
    const delta: Record<string, any> = {}
    for (const headerKey in this.apiLimitTrackers) {
      const headerValue = responseHeaders[headerKey]
      const value = parseInt(headerValue)
      if (headerValue !== undefined && !isNaN(value)) {
        // TODO: track last seen by key? insetad of all? some keys not returned by some endpoints more useful in estimating whether reset should've happened
        this.apiLimitTrackers[headerKey] = value
        delta[headerKey] = {
          updated: true,
          valueParsed: value,
          valueRaw: headerValue
        }
      } else {
        delta[headerKey] = {
          updated: false,
          valueParsed: value,
          valueRaw: headerValue
        }
      }
    }
    // console.log('responseHeaders: ', requestedUrl);
    // console.table(responseHeaders);
    // console.table(delta);
    this.apiLimitLastUpdated = new Date().getTime()
  }
}
