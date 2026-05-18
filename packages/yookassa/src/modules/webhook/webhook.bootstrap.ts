import { Injectable, Logger } from '@nestjs/common'

import { YookassaService } from '../../yookassa.service'
import { NotificationEventEnum } from '../../api'

interface WebhookBootstrapOptions {
  events: NotificationEventEnum[]
  url: string
}

@Injectable()
export class WebhookBootstrapService {
  public constructor(private readonly service: YookassaService) {}

  public async bootstrap(options: WebhookBootstrapOptions) {
    try {
      const webhooks = await this.service.webhooks.getAll()

      for (const event of options.events) {
        const targetWebhook = webhooks.items.find((item) => {
          return item.event === event
        })

        if (targetWebhook && targetWebhook.url === options.url) {
          continue
        }

        this.log(`Create webhook: ${event} to ${options.url}`)
        await this.service.webhooks.create({ event, url: options.url })
      }

      this.log(`Webhook all set: ${options.url}`)
    } catch (error) {
      this.log(`Webhook bootstrap faild`)
      console.log(error)
    }
  }

  private log(message: string) {
    Logger.log(message, 'YOOKASSA-WEBHOOKS')
  }
}
