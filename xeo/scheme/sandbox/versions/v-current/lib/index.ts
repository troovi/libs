/**
 * Поверхность библиотеки этой версии — всё, чем пользуются `core`, `server` и `client` версии. У
 * текущей версии это опубликованные пакеты xeo как есть: схема и целостность (`xeo-scheme`), рантайм
 * доменов, оболочки и очередь событий (`xeo-toolkit`), хуки (`xeo-react`). Следующие версии подменяют
 * или дополняют эти экспорты своим наброском. Код версии импортирует только `../lib` — так видно, чего
 * версия требует от библиотеки.
 */
export * from '@companix/xeo-scheme'
export * from '@companix/xeo-toolkit'
export { schemaOf } from '@companix/xeo-toolkit/dist/schemaOf'
export { createDataSourceHooks } from '@companix/xeo-react'
