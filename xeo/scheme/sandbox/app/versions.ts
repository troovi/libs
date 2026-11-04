export interface VersionEntry {
  /** Ключ версии — первый сегмент адреса (префикс маршрутов приложения версии) и папка `versions/<key>`. */
  key: string
  title: string
  description: string
  /** Экран версии — дашборд и приложение. */
  load: () => Promise<{ Screen: React.ComponentType }>
}

/** Реестр клиентов версий; серверные модули — `server/versions.ts`. */
export const versions: VersionEntry[] = [
  {
    key: 'v-current',
    title: 'v-current — текущая библиотека',
    description: `Точка отсчёта: полный снимок базы при входе, повтор событий журнала над локальной базой, синхронные хуки. Показывает, что приложение держит локально и сколько это стоит.`,
    load: () => import('../versions/v-current/client')
  }
]
