import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { MaxRequest, MaxUserData } from './types'

export const MaxUser = createParamDecorator(
  (data: keyof MaxUserData | null = null, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<MaxRequest>()
    const user = request.maxUser

    if (!user) {
      return null
    }

    return data ? user[data] : user
  }
)
