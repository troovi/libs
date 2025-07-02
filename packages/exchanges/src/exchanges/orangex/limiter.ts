import { QueueManager } from '@troovi/utils-js'
import { Logger } from '@troovi/utils-nodejs'

export class OrangeXLimiter {
  private queue = new QueueManager()
  private logger = new Logger('ORANGEX-LIMITER')

  request<T>(request: () => Promise<T>): Promise<T> {
    this.logger.log(`Sending request... `, 'LIMITS')
    return request()
  }

  limiter<T>(request: () => Promise<T>): Promise<T> {
    return this.queue.add(() => this.request(request))
  }
}
