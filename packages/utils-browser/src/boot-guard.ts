export interface BootGuardOptions {
  /** Префикс пути файлов сборки на своём origin (`/static/`): их отказ до `DOMContentLoaded` — отказ первой загрузки. */
  assets: string
  /** `id` элемента `<template>` со страницей отказа; элемент с атрибутом `data-boot-reload` в ней перезагружает страницу. */
  template: string
  /** Окно после автоматической перезагрузки, в котором повторный отказ показывает страницу отказа, мс. */
  reloadWindow?: number
  /** Ключ отметки автоматической перезагрузки в `sessionStorage`. */
  storageKey?: string
}

/**
 * Страж первой загрузки страницы. Не пришёл стартовый скрипт или стиль сборки — приложение не запустится и показать
 * отказ само не сможет: первый отказ перезагружает страницу, повторный в пределах `reloadWindow` показывает страницу
 * отказа из `<template>`. Отказ после `DOMContentLoaded` — ленивые чанки — страж не трогает: его показывает приложение.
 *
 * Функция встраивается в `<head>` текстом до бандлов, как `colorSchemeScript` uikit: отдельный файл стража сам мог бы
 * не загрузиться. Поэтому она самодостаточна — без импортов и замыканий модуля: сборка вписывает в шаблон
 * `` `const bootGuard = ${bootGuard.toString()}` ``, шаблон вызывает `bootGuard({ … })`.
 */
export const bootGuard = (options: BootGuardOptions) => {
  const { assets, template, reloadWindow = 30000, storageKey = 'boot-guard' } = options

  const status = { isBooting: true, hasFailed: false }

  const assetURL = (target: EventTarget | null) => {
    if (target instanceof HTMLScriptElement) {
      return target.src
    }

    if (target instanceof HTMLLinkElement && target.rel === 'stylesheet') {
      return target.href
    }

    return ''
  }

  // хранилище недоступно — без перезагрузки: иначе отказ ушёл бы в цикл
  const reloadOnce = () => {
    try {
      const last = Number(sessionStorage.getItem(storageKey))

      if (Date.now() - last < reloadWindow) {
        return false
      }

      sessionStorage.setItem(storageKey, String(Date.now()))
      location.reload()
      return true
    } catch {
      return false
    }
  }

  // отказ стиля в <head> может прийти раньше, чем разобраны <body> и шаблон
  const showFailure = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showFailure, { once: true })
      return
    }

    const source = document.getElementById(template)

    if (!(source instanceof HTMLTemplateElement)) {
      return
    }

    const page = source.content.cloneNode(true) as DocumentFragment
    const button = page.querySelector('[data-boot-reload]')

    button?.addEventListener('click', () => location.reload())
    document.body.append(page)
  }

  // отказ загрузки ресурса не всплывает — ловим на погружении
  window.addEventListener(
    'error',
    (event) => {
      const url = assetURL(event.target)

      if (!status.isBooting || status.hasFailed || !url) {
        return
      }

      const { origin, pathname } = new URL(url, location.href)

      if (origin !== location.origin || !pathname.startsWith(assets)) {
        return
      }

      status.hasFailed = true

      if (!reloadOnce()) {
        showFailure()
      }
    },
    true
  )

  document.addEventListener('DOMContentLoaded', () => {
    status.isBooting = false
  })
}
