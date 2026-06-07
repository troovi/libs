import { ParamData } from '@nestjs/common'
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator'
import { Context } from '@maxhub/max-bot-api'
import { MaxParamtype } from './constants'

/** Разрешает значения параметр-декораторов из `(ctx, next)`. */
export class MaxParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: MaxParamtype, data: ParamData, args: unknown[]): unknown {
    const ctx = args[0] as Context
    const next = args[1] as () => Promise<void>

    switch (type) {
      case MaxParamtype.CONTEXT:
        return ctx
      case MaxParamtype.NEXT:
        return next
      case MaxParamtype.SENDER: {
        const sender = ctx.user ?? ctx.message?.sender ?? ctx.callback?.user
        return data && sender ? (sender as Record<string, unknown>)[data as string] : sender
      }
      case MaxParamtype.MESSAGE:
        return data && ctx.message
          ? (ctx.message as unknown as Record<string, unknown>)[data as string]
          : ctx.message
      case MaxParamtype.PAYLOAD:
        return ctx.callback?.payload
      default:
        return null
    }
  }
}
