import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger
} from '@nestjs/common'
import type { Request } from 'express'
import { YOOKASSA_IP_WHITELIST } from '../constants/yookassa-ip-whitelist'
import { isIpAllowed } from '../utils/ip-matcher.util'

@Injectable()
export class YookassaWebhookGuard implements CanActivate {
  private readonly logger = new Logger(YookassaWebhookGuard.name)

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const clientIp = this.extractClientIp(request)

    if (!isIpAllowed(clientIp, YOOKASSA_IP_WHITELIST)) {
      this.logger.warn(`Blocked webhook request from unauthorized IP: ${clientIp}`)

      throw new ForbiddenException('Webhook request is not from YooKassa')
    }

    return true
  }

  private extractClientIp(req: Request): string {
    const clientIp = this.getForwardedForIp(req.headers['x-forwarded-for']) ?? req.socket.remoteAddress
    return this.normalizeIp(clientIp ?? '')
  }

  private getForwardedForIp(header: string | string[] | undefined): string | null {
    const value = this.getHeaderValue(header)

    if (!value) {
      return null
    }

    return this.getFirstIp(value.split(',')[0]?.trim())
  }

  private getHeaderValue(header: string | string[] | undefined): string | null {
    if (typeof header === 'string') {
      return header
    }

    if (Array.isArray(header)) {
      return header[0] ?? null
    }

    return null
  }

  private getFirstIp(value: string | null | undefined): string | null {
    const ip = value?.trim()

    return ip ? ip : null
  }

  private normalizeIp(value: string): string {
    return value.startsWith('::ffff:') ? value.slice(7) : value
  }
}
