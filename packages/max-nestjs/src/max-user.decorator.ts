import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { MaxRequest, MaxUserData } from './types'

export const MaxUser = createParamDecorator(
  (prop: keyof MaxUserData | null = null, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<MaxRequest>()
    const user = request?.maxInitData?.user

    if (!user) {
      return null
    }

    return prop ? user[prop] : user
  }
)
