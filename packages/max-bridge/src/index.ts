export type MaxBridgePlatform = 'ios' | 'android' | 'desktop' | 'web'

type MaxBridgeCallback<T = unknown> = (payload: T) => void

export interface MaxBridgeError {
  code: string
  message?: string
}

export interface MaxBridgeErrorResponse {
  error: MaxBridgeError
}

export type MaxBridgeRequestResult<T extends object = Record<string, unknown>> = T

export type MaxBridgeStorageStatus = 'updated' | 'removed'

/**
 * Объект содержит данные о пользователе, который открывает мини-приложение
 */
export interface MaxBridgeInitDataUser {
  /**
   * Имя пользователя
   */
  first_name?: string

  /**
   * Фамилия пользователя
   */
  last_name?: string

  /**
   * Никнейм пользователя
   */
  username?: string

  /**
   * Язык интерфейса клиента MAX
   * @see https://datatracker.ietf.org/doc/html/rfc5646
   */
  language_code?: string

  /**
   * Ссылка на фото профиля пользователя
   */
  photo_url?: string

  /**
   * Идентификатор пользователя
   */
  id: number
}

/**
 * Объект содержит данные о чате, в котором открыто мини-приложение
 */
export interface MaxBridgeInitDataChat {
  /**
   * Идентификатор чата
   */
  id: number

  /**
   * Тип чата (DIALOG / CHAT / CHANNEL)
   */
  type: 'DIALOG' | 'CHAT' | 'CHANNEL'
}

/**
 * Объект, который содержит данные из `initData` в виде JSON-объекта.
 *
 * Обратите внимание, что объект нельзя использовать для валидации данных.
 */
export interface MaxBridgeInitData {
  /**
   * Хеш переданных параметров, который можно использовать для проверки их достоверности
   */
  hash: string

  /**
   * IP-адрес пользователя
   */
  ip?: string

  /**
   * Уникальный идентификатор текущей сессии
   */
  query_id: string

  /**
   * Значение, переданное в мини-приложение через query-параметр.
   *
   * Пример: `https://max.ru/<your_awesome_bot>?startapp=someData`,
   * где поле `start_param` будет содержать значение `someData`.
   */
  start_param: string

  /**
   * Время выдачи данных. Позволяет определить момент инвалидации данных.
   * Рекомендуемый интервал составляет 1 час
   */
  auth_date: number

  /**
   * Объект содержит данные о пользователе, который открывает мини-приложение
   */
  user: MaxBridgeInitDataUser

  /**
   * Объект содержит данные о чате, в котором открыто мини-приложение
   */
  chat: MaxBridgeInitDataChat
}

export interface MaxBridgeStorageValueResult {
  key: string
  value: string
}

export interface MaxBridgeStorageStatusResult {
  status: MaxBridgeStorageStatus
}

export interface MaxBridgeDeviceStorage {
  /**
   * Метод, который сохраняет переданную пару "ключ-значение" в локальном хранилище устройства
   */
  setItem(key: string, value: string): Promise<MaxBridgeStorageStatusResult>

  /**
   * Метод, который получает значение из локального хранилища устройства по указанному ключу
   */
  getItem(key: string): Promise<MaxBridgeStorageValueResult>

  /**
   * Метод, который удаляет значение из локального хранилища устройства по указанному ключу
   */
  removeItem(key: string): Promise<MaxBridgeStorageStatusResult>

  /**
   * Метод, который очищает все ключи, ранее сохраненные ботом в локальном хранилище устройства
   */
  clear(): Promise<MaxBridgeStorageStatusResult>
}

export interface MaxBridgeSecureStorage {
  /**
   * Метод, который сохраняет переданную пару "ключ-значение" в защищенном хранилище устройства
   */
  setItem(key: string, value: string): Promise<MaxBridgeStorageStatusResult>

  /**
   * Метод, который получает значение из защищённого хранилища устройства по указанному ключу
   */
  getItem(key: string): Promise<MaxBridgeStorageValueResult>

  /**
   * Метод, который удаляет значение из защищённого хранилища устройства по указанному ключу
   */
  removeItem(key: string): Promise<MaxBridgeStorageStatusResult>

  /**
   * Метод, который очищает все ключи, ранее сохраненные ботом в защищённом хранилище устройства
   */
  clear(): Promise<MaxBridgeStorageStatusResult>
}

export type MaxBridgeStorage = MaxBridgeDeviceStorage | MaxBridgeSecureStorage

export interface MaxBridgeBackButton {
  readonly isVisible: boolean

  show(): void
  hide(): void
  onClick(callback: MaxBridgeCallback<MaxBridgeBackButtonPressedEvent>): () => void
  offClick(callback: MaxBridgeCallback<MaxBridgeBackButtonPressedEvent>): void
}

export type MaxBridgeBiometricType = 'finger' | 'face' | 'fingerprint' | 'faceid' | 'unknown'

export interface MaxBridgeBiometryInfo {
  /**
   * Проверка доступности биометрии на устройстве пользователя, который запустил мини-приложение
   */
  available: boolean

  /**
   * Проверка отправки запроса на предоставление доступа к биометрии устройства
   */
  accessRequested: boolean

  /**
   * Проверка предоставления доступа к биометрии
   */
  accessGranted: boolean

  /**
   * Типы биометрии: fingerprint, faceid, unknown
   */
  type: MaxBridgeBiometricType[]

  /**
   * Проверка наличия токена авторизации через биометрию в безопасном хранилище устройства
   */
  tokenSaved: boolean

  /**
   * Идентификатор устройства — можно использовать для сопоставления токена с устройством
   */
  deviceId: string | null
}

export interface MaxBridgeBiometryUpdateTokenResult {
  status: MaxBridgeStorageStatus
}

export interface MaxBridgeBiometryAuthResult {
  status: 'authorized'
  token: string
}

export interface MaxBridgeOpenedResult {
  status: 'opened'
}

export interface MaxBridgeBiometricManager {
  readonly isInited: boolean
  readonly isBiometricAvailable: boolean
  readonly isAccessRequested: boolean
  readonly isAccessGranted: boolean
  readonly isBiometricTokenSaved: boolean
  readonly biometricType: MaxBridgeBiometricType[]
  readonly deviceId: string | null

  getBiometryInfo(): MaxBridgeBiometryInfo

  /**
   * Инициализация
   */
  init(): Promise<MaxBridgeBiometryInfo>

  /**
   * Запрос доступа
   */
  requestAccess(reason?: string): Promise<MaxBridgeBiometryInfo>

  /**
   * Аутентификация
   */
  authenticate(reason?: string): Promise<MaxBridgeBiometryAuthResult>

  /**
   * Обновление биометрического токена
   */
  updateBiometricToken(token?: string, reason?: string): Promise<MaxBridgeBiometryUpdateTokenResult>

  /**
   * Открытие настроек биометрии бота
   */
  openSettings(): Promise<MaxBridgeOpenedResult>
}

export type MaxBridgeHapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
export type MaxBridgeHapticNotificationType = 'error' | 'success' | 'warning'

export interface MaxBridgeHapticImpactResult {
  status: 'impactOccured'
}

export interface MaxBridgeHapticNotificationResult {
  status: 'notificationOccured'
}

export interface MaxBridgeHapticSelectionResult {
  status: 'selectionChanged'
}

export interface MaxBridgeHapticFeedback {
  /**
   * С помощью этого метода приложение MAX может воспроизвести соответствующие тактильные эффекты на основе переданного значения стиля
   */
  impactOccurred(
    impactStyle: MaxBridgeHapticImpactStyle,
    disableVibrationFallback?: boolean
  ): Promise<MaxBridgeHapticImpactResult>

  /**
   * Возвращает статус событий или действий: выполнены успешно, не удалось выполнить или выдано предупреждение
   */
  notificationOccurred(
    notificationType: MaxBridgeHapticNotificationType,
    disableVibrationFallback?: boolean
  ): Promise<MaxBridgeHapticNotificationResult>

  /**
   * Сообщает, что пользователь изменил выбор
   */
  selectionChanged(disableVibrationFallback?: boolean): Promise<MaxBridgeHapticSelectionResult>
}

export interface MaxBridgeSwipesBehaviorResult {
  allowVerticalSwipes: boolean
}

export interface MaxBridgeScreenCaptureResult {
  isScreenCaptureEnabled: boolean
}

export interface MaxBridgeScreenCapture {
  readonly isScreenCaptureEnabled: boolean

  enableScreenCapture(): Promise<MaxBridgeScreenCaptureResult>
  disableScreenCapture(): Promise<MaxBridgeScreenCaptureResult>
}

export interface MaxBridgeNfcInfo {
  /**
   * Проверка наличия NFC-модуля на устройстве пользователя
   */
  available: boolean

  /**
   * Проверка включения NFC-модуля в настройках системы
   */
  enabled: boolean

  /**
   * Отозвал ли пользователь разрешение использовать NFC-модуль для текущего мини-приложения в настройках приватности MAX
   */
  accessRevoked?: boolean
}

export interface MaxBridgeNfcEmulateResult {
  status: 'scanned' | 'stopped'
}

export interface MaxBridgeNfcManager {
  readonly isInited: boolean

  getNfcInfo(): MaxBridgeNfcInfo

  /**
   * Инициализация
   */
  init(): Promise<MaxBridgeNfcInfo>

  /**
   * Эмуляция строки полученной из мини-приложения в виде NFC метки
   */
  emulateNfcTag(nfctag?: string): Promise<MaxBridgeNfcEmulateResult>

  /**
   * Открытие системных настроек NFC модуля на устройстве пользователя
   */
  openSystemSettings(): Promise<MaxBridgeOpenedResult>
}

export interface MaxBridgePhoneResult {
  /**
   * Номер телефона пользователя
   */
  phone: string

  /**
   * Timestamp создания hash
   */
  authDate: string

  /**
   * Хеш для проверки номера телефона
   */
  hash: string
}

export interface MaxBridgeBrightnessResult {
  maxBrightness: boolean
}

export interface MaxBridgeDownloadFileResult {
  status: 'downloading' | 'cancelled'
}

export interface MaxBridgeShareContent {
  /**
   * Текст для шеринга
   */
  text?: string

  /**
   * Ссылка для шеринга
   */
  link?: string
}

export interface MaxBridgeShareResult {
  status: 'shared' | 'cancelled'
}

export interface MaxBridgeShareMaxByMid {
  mid: string
  chatType: 'DIALOG' | 'CHAT'
}

export interface MaxBridgeShareMaxByIds {
  chatId: string
  messageId: string
}

export type MaxBridgeShareMaxContent =
  | MaxBridgeShareContent
  | MaxBridgeShareMaxByMid
  | MaxBridgeShareMaxByIds

export interface MaxBridgeCodeReaderResult {
  value: string
}

export interface MaxBridgeBackButtonPressedEvent {
  [key: string]: unknown
}

export interface MaxBridgeEventMap {
  WebAppBackButtonPressed: MaxBridgeBackButtonPressedEvent
}

export interface MaxBridgePostEventPayloadMap {
  WebAppClose: Record<string, never>
  WebAppReady: Record<string, never>
  WebAppSetupBackButton: { isVisible: boolean }
  WebAppSetupClosingBehavior: { needConfirmation: boolean }
  WebAppOpenLink: { url: string }
  WebAppOpenMaxLink: { url: string }
}

export interface MaxBridgeWebViewHandler {
  postEvent(eventType: string, eventData: string): void
}

export interface MaxBridgeWebApp {
  /**
   * Сырые данные инициализации
   */
  readonly initData: string | null

  /**
   * Распарсенные данные инициализации
   */
  readonly initDataUnsafe: MaxBridgeInitData
  readonly platform: MaxBridgePlatform | null
  readonly version: string | null

  /**
   * Состояние вертикальных свайпов
   */
  readonly isVerticalSwipesEnabled: boolean

  readonly SecureStorage: MaxBridgeSecureStorage
  readonly DeviceStorage: MaxBridgeDeviceStorage
  readonly BackButton: MaxBridgeBackButton
  readonly BiometricManager: MaxBridgeBiometricManager
  readonly NfcManager: MaxBridgeNfcManager
  readonly HapticFeedback: MaxBridgeHapticFeedback
  readonly ScreenCapture: MaxBridgeScreenCapture

  /**
   * Стандартная отправка событий (без ожидания ответа)
   */
  postEvent<TEvent extends keyof MaxBridgePostEventPayloadMap>(
    eventType: TEvent,
    eventData?: MaxBridgePostEventPayloadMap[TEvent],
    callback?: () => void
  ): void
  postEvent(eventType: string, eventData?: Record<string, unknown>, callback?: () => void): void

  /**
   * Обработка полученного события
   * Простое разделение: requestId есть -> RequestController, нет -> event handlers
   */
  receiveEvent<TEvent extends keyof MaxBridgeEventMap>(
    eventType: TEvent,
    eventData: MaxBridgeEventMap[TEvent]
  ): Promise<void>
  receiveEvent(eventType: string, eventData: unknown): Promise<void>

  /**
   * Функция, которую используют нативные клиенты для отправки ответа
   */
  sendEvent(eventType: string, eventData?: string): Promise<void>

  /**
   * Подписка на событие с использованием колбэка
   */
  onEvent<TEvent extends keyof MaxBridgeEventMap>(
    eventType: TEvent,
    callback: MaxBridgeCallback<MaxBridgeEventMap[TEvent]>
  ): () => void
  onEvent<TPayload = unknown>(eventType: string, callback: MaxBridgeCallback<TPayload>): () => void

  /**
   * Удаление подписки на событие
   */
  offEvent<TEvent extends keyof MaxBridgeEventMap>(
    eventType: TEvent,
    callback: MaxBridgeCallback<MaxBridgeEventMap[TEvent]>
  ): void
  offEvent<TPayload = unknown>(eventType: string, callback: MaxBridgeCallback<TPayload>): void

  /**
   * Изменить яркость экрана на максимум
   * Клиент держит яркость 30 секунд, затем сбрасывает в первоначальное значение
   */
  requestScreenMaxBrightness(): Promise<MaxBridgeBrightnessResult>

  /**
   * Восстановить яркость экрана
   */
  restoreScreenBrightness(): Promise<MaxBridgeBrightnessResult>

  /**
   * Закрытие приложения
   */
  close(): void

  /**
   * Инициализация WebApp API
   */
  ready(): void

  /**
   * Запрос номера телефона
   */
  requestContact(): Promise<MaxBridgePhoneResult>

  /**
   * Подтверждать закрытие миниаппа с помощью всплывающего окна
   */
  enableClosingConfirmation(): void

  /**
   * Отключение подтверждения закрытия миниаппа
   */
  disableClosingConfirmation(): void

  /**
   * Открытие ссылки во внешнем браузере
   */
  openLink(url: string): void

  /**
   * Открытие диплинка связанного с max.ru
   */
  openMaxLink(url: string): void

  /**
   * Скачивание файла
   */
  downloadFile(url: string, fileName: string): Promise<MaxBridgeDownloadFileResult>

  /**
   * Вызов нативного экрана шаринга
   */
  shareContent(content: MaxBridgeShareContent): Promise<MaxBridgeShareResult>

  /**
   * Шаринг в диалоги/чаты Max
   */
  shareMaxContent(content: MaxBridgeShareMaxContent): Promise<MaxBridgeShareResult>

  /**
   * Включение вертикальных свайпов
   */
  enableVerticalSwipes(): Promise<MaxBridgeSwipesBehaviorResult>

  /**
   * Отключение вертикальных свайпов
   */
  disableVerticalSwipes(): Promise<MaxBridgeSwipesBehaviorResult>

  /**
   * Открывает камеру для считывания QR кода и получает результат сканирования.
   */
  openCodeReader(fileSelect?: boolean): Promise<MaxBridgeCodeReaderResult>
}

declare global {
  interface Window {
    WebApp: MaxBridgeWebApp
    WebViewHandler?: MaxBridgeWebViewHandler
  }

  const WebApp: MaxBridgeWebApp
}
