import { ArgumentsHost, ContextType, ExecutionContext } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'

export type MaxContextType = 'max' | ContextType

/**
 * ExecutionContext для MAX-обработчиков. Позволяет guard'ам и param-декораторам
 * (`@AuthUser`) достать `ctx`/`next` из аргументов `(ctx, next)`.
 * Аналог `TelegrafExecutionContext` из nestjs-telegraf.
 */
export class MaxExecutionContext extends ExecutionContextHost {
  static create(context: ExecutionContext): MaxExecutionContext {
    const type = context.getType()
    const ctx = new MaxExecutionContext(
      context.getArgs(),
      context.getClass(),
      context.getHandler()
    )
    ctx.setType(type)
    return ctx
  }

  getType<TContext extends string = MaxContextType>(): TContext {
    return super.getType()
  }

  getContext<T = unknown>(): T {
    return this.getArgByIndex(0)
  }

  getNext<T = unknown>(): T {
    return this.getArgByIndex(1)
  }
}

/** Облегчённый ArgumentsHost (для exception-фильтров). */
export class MaxArgumentsHost extends ExecutionContextHost {
  static create(context: ArgumentsHost): MaxArgumentsHost {
    const host = new MaxArgumentsHost(context.getArgs())
    host.setType(context.getType())
    return host
  }

  getContext<T = unknown>(): T {
    return this.getArgByIndex(0)
  }

  getNext<T = unknown>(): T {
    return this.getArgByIndex(1)
  }
}
