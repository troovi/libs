import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Module } from '@nestjs/core/injector/module'

/** Обход модулей/провайдеров. Порт nestjs-telegraf без lodash. */
export class BaseExplorerService {
  getModules(modulesContainer: Map<string, Module>, include: Function[]): Module[] {
    if (!include || include.length === 0) {
      return [...modulesContainer.values()]
    }
    return [...modulesContainer.values()].filter(({ metatype }) =>
      include.includes(metatype as Function)
    )
  }

  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper, moduleRef: Module) => T | undefined
  ): T[] {
    const visited = new Set<Module>()

    const unwrap = (moduleRef: Module): T[] => {
      if (visited.has(moduleRef)) {
        return []
      }
      visited.add(moduleRef)

      const defined = [...moduleRef.providers.values()].map((wrapper) =>
        callback(wrapper, moduleRef)
      )

      const imported = moduleRef.imports?.size
        ? [...moduleRef.imports.values()].flatMap((cur) => unwrap(cur))
        : []

      return [...defined, ...imported].filter((value): value is T => !!value)
    }

    return modules.flatMap(unwrap)
  }
}
