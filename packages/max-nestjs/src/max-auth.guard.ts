import {
  CanActivate,
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  type ExecutionContext,
  HttpException
} from '@nestjs/common'
import { MAX_OPTIONS_SYMBOL } from './max.constants'
import type { MaxResolvedModuleOptions } from './max.interface'
import type { MaxRequest } from './types'
import { createHmac } from 'crypto'
import { MAX_WEB_APP_DATA_KEY } from './max.constants'
import type { MaxInitData } from './types'
import { safeEqual } from '@companix/utils-nodejs'

@Injectable()
export class MaxAuthGuard implements CanActivate {
  public constructor(
    @Inject(MAX_OPTIONS_SYMBOL)
    private readonly options: MaxResolvedModuleOptions
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MaxRequest>()
    const rawInitData = request.headers[this.options.headerName]

    if (!rawInitData || typeof rawInitData !== 'string') {
      throw new UnauthorizedException('MAX init data is missing')
    }

    try {
      const { initData, entities } = this.parseInitData(rawInitData)

      if (!this.validateInitData(entities, initData.hash)) {
        throw new UnauthorizedException('Invalid MAX init data signature')
      }

      request.maxInitData = initData
      request.maxUser = initData.user

      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new UnauthorizedException('Failed to validate Max init data')
    }
  }

  private validateInitData(entities: [string, string][], hash: string) {
    const dataCheckString = entities
      .filter(([key]) => key !== 'hash')
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = createHmac('sha256', MAX_WEB_APP_DATA_KEY).update(this.options.botToken).digest()
    const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    return safeEqual(calculatedHash, hash)
  }

  private parseInitData(rawInitData: string) {
    const params = new URLSearchParams(rawInitData)
    const entities = Array.from(params.entries())
    const initData: Partial<MaxInitData> = {}

    for (const [key, value] of entities) {
      switch (key) {
        case 'auth_date':
          initData.auth_date = parseRequiredInteger(key, value)
          break
        case 'hash':
          initData.hash = value
          break
        case 'ip':
          initData.ip = value
          break
        case 'query_id':
          initData.query_id = value
          break
        case 'start_param':
          initData.start_param = value
          break
        case 'chat':
          initData.chat = parseJsonValue(key, value)
          break
        case 'user':
          initData.user = parseJsonValue(key, value)
          break
      }
    }

    if (!initData.hash || !initData.auth_date || !initData.user) {
      throw new BadRequestException('Invalid init data format')
    }

    return {
      entities,
      initData: initData as MaxInitData
    }
  }
}

const parseRequiredInteger = (key: string, value: string): number => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed)) {
    throw new BadRequestException(`Invalid MAX init data numeric value for "${key}"`)
  }

  return parsed
}

const parseJsonValue = <T>(key: string, value: string): T => {
  try {
    return JSON.parse(value) as T
  } catch {
    throw new BadRequestException(`Invalid MAX init data JSON value for "${key}"`)
  }
}
