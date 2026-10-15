/**
 * Конфиг визуализации в целевом проекте — файл `xeo-visual.config.ts` рядом с `package.json`:
 *
 * ```ts
 * import { defineConfig } from '@companix/xeo-visual'
 * import { dataScheme } from './scheme'
 *
 * export default defineConfig({
 *   scheme: dataScheme,
 *   sourceDir: './scheme',
 *   bands: [['sales', 'execution'], ['clients', 'people']],
 *   zones: [{ id: 'sales', title: 'Продажи', color: '#e2580b', files: [['sales.ts']] }]
 * })
 * ```
 *
 * Пути считаются от папки файла конфига. Конфиг выполняется в отдельном процессе на каждую сборку, поэтому
 * схема с декораторами загружается заново и изменения в ней подхватываются без перезапуска.
 */
import type { VisualConfig } from './config'
import type { SchemeSource } from './scheme-meta'

export interface XeoVisualConfig extends VisualConfig {
  /** Схема данных проекта (`new DataScheme({...})`); типизирована структурно — подходит любая версия xeo-scheme. */
  scheme: SchemeSource
  /** Папка с классами схемы (`*.ts`): из неё берутся файлы, JSDoc, декораторы и типы полей. */
  sourceDir: string
  /** tsconfig проекта для разрешения типов; по умолчанию — ближайший к файлу конфига. */
  tsconfig?: string
  /**
   * Что ещё отслеживать в `xeo-visual dev`. Папка конфига отслеживается всегда — этого достаточно, если схема и
   * её импорты лежат внутри проекта.
   */
  watch?: string[]
  /** Куда `xeo-visual build` пишет `<name>.html` и `<name>.svg`; по умолчанию папка конфига и `scheme-map`. */
  output?: { dir?: string; name?: string }
}

export const defineConfig = (config: XeoVisualConfig): XeoVisualConfig => config

export const CONFIG_FILES = [
  'xeo-visual.config.ts',
  'xeo-visual.config.cts',
  'xeo-visual.config.js',
  'xeo-visual.config.cjs'
]
