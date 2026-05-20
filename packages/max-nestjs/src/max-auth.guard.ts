import {
  CanActivate,
  Inject,
  Injectable,
  UnauthorizedException,
  type ExecutionContext
} from '@nestjs/common'
import { MAX_OPTIONS_SYMBOL } from './max.constants'
import type { MaxResolvedModuleOptions } from './max.interface'
import type { MaxRequest } from './types'
import { BadRequestException } from '@nestjs/common'
import { createHmac, timingSafeEqual } from 'crypto'
import { MAX_WEB_APP_DATA_KEY } from './max.constants'
import type { MaxInitData } from './types'

interface RawParam {
  key: string
  value: string
}

@Injectable()
export class MaxAuthGuard implements CanActivate {
  public constructor(
    @Inject(MAX_OPTIONS_SYMBOL)
    private readonly options: MaxResolvedModuleOptions
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MaxRequest>()
    const headerValue = request.headers[this.options.headerName]

    if (typeof headerValue !== 'string') {
      throw new UnauthorizedException('MAX init data is missing')
    }

    const initData = this.validateInitData(headerValue)

    request.maxInitData = initData
    request.maxUser = initData.user

    return true
  }

  private validateInitData(rawInitData: string): MaxInitData {
    const params = parseRawParams(rawInitData)
    const hashParam = getRequiredUniqueParam(params, 'hash')
    const authDateParam = getRequiredUniqueParam(params, 'auth_date')
    const userParam = getRequiredUniqueParam(params, 'user')

    const launchParams = params
      .filter((param) => param.key !== 'hash')
      .sort((left, right) => left.key.localeCompare(right.key))
      .map((param) => `${param.key}=${param.value}`)
      .join('\n')

    const secretKey = createHmac('sha256', MAX_WEB_APP_DATA_KEY).update(this.options.botToken).digest()
    const calculatedHash = createHmac('sha256', secretKey).update(launchParams).digest('hex')

    if (!safeEqual(calculatedHash, hashParam.value)) {
      throw new UnauthorizedException('Invalid MAX init data signature')
    }

    return {
      auth_date: Number.parseInt(authDateParam.value, 10),
      hash: hashParam.value,
      ip: getOptionalParam(params, 'ip'),
      query_id: getOptionalParam(params, 'query_id'),
      start_param: getOptionalParam(params, 'start_param'),
      chat: parseOptionalJsonParam<MaxInitData['chat']>(params, 'chat'),
      user: parseJsonValue(userParam.key, userParam.value)
    }
  }
}

const parseRawParams = (rawInitData: string): RawParam[] => {
  const parts = rawInitData.split('&')

  if (!parts.length) {
    throw new BadRequestException('MAX init data is empty')
  }

  const params = parts.map(parseRawParam)
  const occurrences = new Map<string, number>()

  for (const param of params) {
    occurrences.set(param.key, (occurrences.get(param.key) ?? 0) + 1)
  }

  for (const [key, count] of occurrences) {
    if (count !== 1) {
      throw new BadRequestException(`MAX init data contains duplicate parameter "${key}"`)
    }
  }

  return params
}

const parseRawParam = (rawParam: string): RawParam => {
  const separatorIndex = rawParam.indexOf('=')

  if (separatorIndex <= 0) {
    throw new BadRequestException('Invalid MAX init data parameter')
  }

  const key = rawParam.slice(0, separatorIndex)
  const encodedValue = rawParam.slice(separatorIndex + 1)

  return {
    key,
    value: decodeValue(encodedValue)
  }
}

const decodeValue = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new BadRequestException('Failed to decode MAX init data parameter')
  }
}

const getRequiredUniqueParam = (params: RawParam[], key: string): RawParam => {
  const matches = params.filter((param) => param.key === key)

  if (matches.length !== 1) {
    throw new BadRequestException(`MAX init data must contain exactly one "${key}" parameter`)
  }

  return matches[0]
}

const getOptionalParam = (params: RawParam[], key: string): string | undefined => {
  const match = params.find((param) => param.key === key)

  return match?.value
}

const parseOptionalJsonParam = <T>(params: RawParam[], key: string): T | undefined => {
  const value = getOptionalParam(params, key)

  if (value === undefined) {
    return undefined
  }

  return parseJsonValue(key, value)
}

const parseJsonValue = <T>(key: string, value: string): T => {
  try {
    return JSON.parse(value) as T
  } catch {
    throw new BadRequestException(`Invalid MAX init data JSON value for "${key}"`)
  }
}

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, 'utf8')
  const rightBuffer = Buffer.from(right, 'utf8')

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
