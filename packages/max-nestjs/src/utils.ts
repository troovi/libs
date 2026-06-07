import { assignMetadata } from '@nestjs/common'
import { DEFAULT_BOT_NAME, LISTENERS_METADATA, MaxParamtype, PARAM_ARGS_METADATA } from './constants'
import { ListenerMetadata } from './interfaces'

/** DI-токен бота по имени (`undefined` → дефолтный бот). */
export const getBotToken = (name?: string): string => {
  return name ? `${name}_MaxBot` : DEFAULT_BOT_NAME
}

/**
 * Фабрика декораторов-слушателей методов (`@Command`, `@On`, ...). Складывает в
 * метаданные метода список `{ method, args }`, который explorer применяет к
 * composer'у: `composer[method](...args, handler)`. Порт nestjs-telegraf.
 */
export function createListenerDecorator<T = unknown>(method: ListenerMetadata['method']) {
  return (...args: T[]): MethodDecorator => {
    return (target, _key, descriptor?: TypedPropertyDescriptor<any>) => {
      const metadata: ListenerMetadata[] = [{ method, args }]

      if (descriptor) {
        const previous: ListenerMetadata[] =
          Reflect.getMetadata(LISTENERS_METADATA, descriptor.value) || []
        Reflect.defineMetadata(LISTENERS_METADATA, [...previous, ...metadata], descriptor.value)
        return descriptor
      }

      Reflect.defineMetadata(LISTENERS_METADATA, metadata, target as object)
      return target
    }
  }
}

/** Фабрика параметр-декораторов (`@Ctx`, `@Message`, ...). Порт nestjs-telegraf. */
export const createParamDecorator = (paramtype: MaxParamtype) => {
  return (data?: string): ParameterDecorator => {
    return (target, key, index) => {
      const args = Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key!) || {}
      Reflect.defineMetadata(
        PARAM_ARGS_METADATA,
        assignMetadata(args, paramtype, index, data),
        target.constructor,
        key!
      )
    }
  }
}
